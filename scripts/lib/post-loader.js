/**
 * post-loader.js — discover posts in 01_POSTS/, return structured post objects.
 *
 * A post is a directory containing body.md and one or more per-target
 * frontmatter files (markdown.md, hugo.md, ghost.md, substack.md, jekyll.md).
 *
 * Returns an array of post objects:
 * {
 *   dir: absolute directory path
 *   slug: derived from directory name (or frontmatter)
 *   bodyPath: path to body.md
 *   bodyContent: read body.md content
 *   adapters: [{ name, frontmatter, frontmatterPath, raw }] — one entry per per-target file present
 *   media?: parsed media.yaml if present
 *   mediaPath?: absolute path to media.yaml
 *   transcriptPath?: absolute path to transcript.md if present
 *   assets: array of asset paths referenced by the body
 *   isSeries: boolean
 *   seriesSlug?: parent series slug (if this post is a series part)
 * }
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');
const { resolveIncludes } = require('./include');

// Adapter names that the post-loader recognizes as per-target frontmatter files.
// New adapters can be added here when shipped.
const KNOWN_ADAPTERS = ['markdown', 'hugo', 'ghost', 'substack', 'jekyll'];

function isPostDirectory(absDir) {
  // A post directory contains body.md and at least one per-target frontmatter file.
  if (!fs.existsSync(path.join(absDir, 'body.md'))) return false;
  return KNOWN_ADAPTERS.some((a) => fs.existsSync(path.join(absDir, `${a}.md`)));
}

function isSeriesDirectory(absDir) {
  // A series directory contains _index.md and subdirectories that are themselves posts.
  if (!fs.existsSync(path.join(absDir, '_index.md'))) return false;
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .some((e) => e.isDirectory() && isPostDirectory(path.join(absDir, e.name)));
}

function extractAssetReferences(bodyContent) {
  // Find ![alt](path) and [text](path) markdown links to local paths
  const found = new Set();
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const m of bodyContent.matchAll(linkPattern)) {
    const target = m[1].split(/\s+/)[0]; // strip optional title
    // Skip URLs and absolute paths and anchors
    if (/^[a-z]+:\/\//i.test(target)) continue;
    if (target.startsWith('#')) continue;
    if (target.startsWith('mailto:')) continue;
    found.add(target);
  }
  return [...found];
}

// Strip a leading YYYY-MM-DD- date prefix from a slug if present.
// Posts are conventionally named "YYYY-MM-DD-<slug>" for chronological browsing,
// but most adapters want the descriptive slug only (date comes from frontmatter).
function stripDatePrefix(s) {
  return s.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function loadPost(absDir, postsRoot) {
  const bodyPath = path.join(absDir, 'body.md');
  const bodyContent = fs.readFileSync(bodyPath, 'utf8');
  const slug = path.basename(absDir);
  const cleanSlug = stripDatePrefix(slug);
  const relFromPosts = path.relative(postsRoot, absDir).replace(/\\/g, '/');
  const seriesParts = relFromPosts.split('/');
  const isSeries = seriesParts.length > 1;
  const seriesSlug = isSeries ? seriesParts[0] : undefined;

  // Discover adapter files present in the directory
  const adapters = [];
  for (const adapterName of KNOWN_ADAPTERS) {
    const fmPath = path.join(absDir, `${adapterName}.md`);
    if (!fs.existsSync(fmPath)) continue;
    const raw = fs.readFileSync(fmPath, 'utf8');
    const resolved = resolveIncludes(raw, fmPath);
    const parsed = matter(resolved);
    adapters.push({
      name: adapterName,
      frontmatter: parsed.data,
      frontmatterPath: fmPath,
      raw,
      resolvedBody: parsed.content,
    });
  }

  // Optional media.yaml (audio/video posts)
  const mediaPath = path.join(absDir, 'media.yaml');
  let media = null;
  if (fs.existsSync(mediaPath)) {
    try {
      media = yaml.load(fs.readFileSync(mediaPath, 'utf8'));
    } catch (e) {
      throw new Error(`post-loader: media.yaml in ${slug} failed to parse: ${e.message}`);
    }
  }

  // Optional transcript
  const transcriptPath = path.join(absDir, 'transcript.md');
  const hasTranscript = fs.existsSync(transcriptPath);

  return {
    dir: absDir,
    slug,
    cleanSlug,
    bodyPath,
    bodyContent,
    adapters,
    media,
    mediaPath: media ? mediaPath : undefined,
    transcriptPath: hasTranscript ? transcriptPath : undefined,
    assets: extractAssetReferences(bodyContent),
    isSeries,
    seriesSlug,
  };
}

/**
 * Walk 01_POSTS/, return all posts (top-level + nested in series subdirs).
 */
function loadAllPosts(repoRoot) {
  const postsRoot = path.join(repoRoot, '01_POSTS');
  if (!fs.existsSync(postsRoot)) return [];
  const posts = [];

  function walk(absDir) {
    if (isPostDirectory(absDir)) {
      posts.push(loadPost(absDir, postsRoot));
      return;
    }
    if (!fs.statSync(absDir).isDirectory()) return;
    for (const e of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name.startsWith('_')) continue;
      const full = path.join(absDir, e.name);
      if (e.isDirectory()) walk(full);
    }
  }
  walk(postsRoot);
  return posts;
}

/**
 * Discover series at 01_POSTS/<series-slug>/. Returns array of series objects:
 * { slug, dir, indexPath, indexFrontmatter, partSlugs: [...], parts: [postObj, ...] (sorted by series_order) }
 */
function loadAllSeries(repoRoot, allPosts) {
  const postsRoot = path.join(repoRoot, '01_POSTS');
  if (!fs.existsSync(postsRoot)) return [];
  const series = [];
  for (const e of fs.readdirSync(postsRoot, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const dir = path.join(postsRoot, e.name);
    if (!isSeriesDirectory(dir)) continue;
    const indexPath = path.join(dir, '_index.md');
    const indexFrontmatter = matter(fs.readFileSync(indexPath, 'utf8')).data;
    const parts = allPosts
      .filter((p) => p.seriesSlug === e.name)
      .sort((a, b) => {
        // Sort by series_order from any adapter's frontmatter (they should agree)
        const aOrder = a.adapters[0] && a.adapters[0].frontmatter.series_order;
        const bOrder = b.adapters[0] && b.adapters[0].frontmatter.series_order;
        return (aOrder || 0) - (bOrder || 0);
      });
    series.push({
      slug: e.name,
      dir,
      indexPath,
      indexFrontmatter,
      partSlugs: parts.map((p) => p.slug),
      parts,
    });
  }
  return series;
}

module.exports = { loadAllPosts, loadAllSeries, KNOWN_ADAPTERS };
