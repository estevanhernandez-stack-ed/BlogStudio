/**
 * series-indexer.js — generate series index pages and inject cross-links into
 * each part's output.
 *
 * Called by build.js after all posts are compiled. Reads the series structure
 * from 01_POSTS/<series-slug>/ and produces per-adapter series index files in
 * dist/<adapter>/series/<series-slug>/.
 *
 * Cross-link injection: for each compiled output of a series part, prepends a
 * "Part N of M" header and appends "Previous / Next" navigation.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a markdown series index page from a series object.
 * Used by adapters that support markdown indices (Hugo, Jekyll, plain markdown).
 */
function buildSeriesIndexMarkdown(series) {
  const lines = [];
  const fm = series.indexFrontmatter || {};
  lines.push('---');
  if (fm.title) lines.push(`title: "${fm.title}"`);
  if (fm.description) lines.push(`description: "${fm.description}"`);
  if (fm.date) lines.push(`date: ${fm.date}`);
  if (fm.estimated_parts != null) lines.push(`estimated_parts: ${fm.estimated_parts}`);
  lines.push('---');
  lines.push('');
  if (fm.description) {
    lines.push(fm.description);
    lines.push('');
  }
  lines.push('## Parts');
  lines.push('');
  for (let i = 0; i < series.parts.length; i++) {
    const part = series.parts[i];
    const partTitle = (part.adapters[0] && part.adapters[0].frontmatter.title) || part.slug;
    lines.push(`- [Part ${i + 1}: ${partTitle}](${part.slug}/)`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Write series indices to dist/<adapter>/series/<series-slug>/ for adapters
 * declaring `capabilities.series === true`.
 */
function writeSeriesIndices(repoRoot, allSeries, adapters) {
  const distRoot = path.join(repoRoot, 'dist');
  for (const adapter of adapters) {
    if (!adapter.capabilities || !adapter.capabilities.series) continue;
    for (const series of allSeries) {
      const dir = path.join(distRoot, adapter.name, 'series', series.slug);
      fs.mkdirSync(dir, { recursive: true });
      const ext = adapter.outputExtension || '.md';
      const indexPath = path.join(dir, `_index${ext}`);
      fs.writeFileSync(indexPath, buildSeriesIndexMarkdown(series));
    }
  }
}

/**
 * Build a navigation block for a series part — Previous / Next + Part N of M.
 * Returned as a markdown snippet that adapters can append to part outputs.
 */
function buildSeriesNav(series, partIndex) {
  const total = series.parts.length;
  const lines = [];
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*Part ${partIndex + 1} of ${total} in [${series.indexFrontmatter.title || series.slug}](../).*`);
  lines.push('');
  const navParts = [];
  if (partIndex > 0) {
    const prev = series.parts[partIndex - 1];
    const prevTitle =
      (prev.adapters[0] && prev.adapters[0].frontmatter.title) || prev.slug;
    navParts.push(`← [${prevTitle}](../${prev.slug}/)`);
  }
  if (partIndex < total - 1) {
    const next = series.parts[partIndex + 1];
    const nextTitle =
      (next.adapters[0] && next.adapters[0].frontmatter.title) || next.slug;
    navParts.push(`[${nextTitle}](../${next.slug}/) →`);
  }
  if (navParts.length > 0) {
    lines.push(navParts.join('  ·  '));
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * Find which series a post belongs to (if any) and its index within the series.
 */
function findPartIndex(post, allSeries) {
  for (const series of allSeries) {
    const idx = series.parts.findIndex((p) => p.slug === post.slug);
    if (idx >= 0) return { series, partIndex: idx };
  }
  return null;
}

module.exports = { writeSeriesIndices, buildSeriesNav, findPartIndex };
