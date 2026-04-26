#!/usr/bin/env node
/**
 * build.js — main build orchestrator.
 *
 * Pipeline:
 *   1. Compile design tokens (tokens.yaml -> compiled/{tokens.css, tokens.json})
 *   2. Load all posts from 01_POSTS/
 *   3. Load adapter modules from adapters/
 *   4. For each post, for each per-target frontmatter file present, invoke the
 *      matching adapter and write to dist/<adapter>/<filename>.
 *   5. Write per-output manifest sidecars.
 *   6. Generate series indices for adapters that support series.
 *
 * Flags:
 *   --adapter <name>    Build only outputs for the named adapter
 *   --post <slug>       Build only the named post (matches by directory slug)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { spawnSync } = require('child_process');
const { loadAllPosts, loadAllSeries, KNOWN_ADAPTERS } = require('./lib/post-loader');
const { loadAdapters, runAdapter, findAdapterByName } = require('./lib/adapter-runner');
const { writeManifest } = require('./lib/manifest');
const { writeSeriesIndices, buildSeriesNav, findPartIndex } = require('./lib/series-indexer');

const REPO_ROOT = path.resolve(__dirname, '..');
const COMPILED_DIR = path.join(REPO_ROOT, '00_DESIGN_SYSTEM', 'compiled');
const TOKENS_YAML = path.join(REPO_ROOT, '00_DESIGN_SYSTEM', 'tokens.yaml');
const DIST_DIR = path.join(REPO_ROOT, 'dist');

function parseFlags(argv) {
  const flags = { adapter: null, post: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--adapter' && argv[i + 1]) {
      flags.adapter = argv[i + 1];
      i++;
    } else if (argv[i] === '--post' && argv[i + 1]) {
      flags.post = argv[i + 1];
      i++;
    }
  }
  return flags;
}

function ensureTokensCompiled() {
  const compiledJson = path.join(COMPILED_DIR, 'tokens.json');
  if (fs.existsSync(compiledJson)) return;
  console.log('build: compiled tokens missing — running compile-tokens first...');
  const result = spawnSync('node', [path.join(__dirname, 'compile-tokens.js')], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error('build: compile-tokens failed.');
    process.exit(result.status || 1);
  }
}

function loadDesignSystem() {
  const tokens = yaml.load(fs.readFileSync(TOKENS_YAML, 'utf8'));
  const compiledJson = path.join(COMPILED_DIR, 'tokens.json');
  const compiledCss = path.join(COMPILED_DIR, 'tokens.css');
  return {
    tokens,
    compiled: {
      json: fs.existsSync(compiledJson) ? JSON.parse(fs.readFileSync(compiledJson, 'utf8')) : null,
      css: fs.existsSync(compiledCss) ? fs.readFileSync(compiledCss, 'utf8') : '',
    },
  };
}

function copyAssets(post, adapter, outputAbsDir) {
  // Resolve any relative asset paths referenced by the body and copy them
  // into the adapter's output dir under a per-post subdir.
  const assetsRoot = path.join(REPO_ROOT, '03_ASSETS');
  if (!fs.existsSync(assetsRoot)) return;

  // Look for assets in 03_ASSETS/<post-slug>/
  const postAssetsDir = path.join(assetsRoot, post.slug);
  if (!fs.existsSync(postAssetsDir)) return;

  const adapterMode =
    (adapter.capabilities && adapter.capabilities.assets) || 'external';
  if (adapterMode !== 'bundled') return; // only bundle for adapters that want it

  const targetDir = path.join(outputAbsDir, '..', post.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(postAssetsDir, { withFileTypes: true })) {
    if (entry.isFile()) {
      fs.copyFileSync(path.join(postAssetsDir, entry.name), path.join(targetDir, entry.name));
    }
  }
}

function main() {
  const flags = parseFlags(process.argv);

  ensureTokensCompiled();
  const designSystem = loadDesignSystem();

  const allPosts = loadAllPosts(REPO_ROOT);
  if (allPosts.length === 0) {
    console.warn('build: no posts found in 01_POSTS/. Add a post directory with body.md + per-target frontmatter file.');
    process.exit(0);
  }

  const allSeries = loadAllSeries(REPO_ROOT, allPosts);
  const adapters = loadAdapters(REPO_ROOT);
  if (adapters.length === 0) {
    console.error('build: no adapters loaded from adapters/. Check that adapters/<name>.js files exist and match the contract.');
    process.exit(1);
  }

  // Filter by --adapter and --post if specified
  const selectedAdapters = flags.adapter
    ? adapters.filter((a) => a.name === flags.adapter)
    : adapters;
  if (flags.adapter && selectedAdapters.length === 0) {
    console.error(`build: no adapter named "${flags.adapter}" found.`);
    process.exit(1);
  }

  const selectedPosts = flags.post
    ? allPosts.filter((p) => p.slug === flags.post)
    : allPosts;
  if (flags.post && selectedPosts.length === 0) {
    console.error(`build: no post with slug "${flags.post}" found.`);
    process.exit(1);
  }

  let totalOutputs = 0;
  let totalErrors = 0;

  for (const post of selectedPosts) {
    for (const adapterEntry of post.adapters) {
      const adapter = findAdapterByName(selectedAdapters, adapterEntry.name);
      if (!adapter) continue; // adapter not selected (filtered) or not loaded

      // Inject series nav if this post is part of a series and adapter supports series
      let postForCompile = post;
      const partInfo = findPartIndex(post, allSeries);
      if (partInfo && adapter.capabilities && adapter.capabilities.series) {
        const nav = buildSeriesNav(partInfo.series, partInfo.partIndex);
        postForCompile = {
          ...post,
          bodyContent: post.bodyContent + nav,
        };
      }

      const result = runAdapter(adapter, postForCompile, designSystem);
      if (!result) {
        totalErrors++;
        continue;
      }

      const outputAbsPath = path.join(DIST_DIR, adapter.name, result.filename);
      fs.mkdirSync(path.dirname(outputAbsPath), { recursive: true });
      fs.writeFileSync(outputAbsPath, result.content);
      totalOutputs++;

      // Write any sidecars the adapter produced (e.g., Ghost's import JSON)
      if (result.sidecars) {
        for (const [sidecarName, sidecarContent] of Object.entries(result.sidecars)) {
          const sidecarPath = path.join(path.dirname(outputAbsPath), sidecarName);
          fs.writeFileSync(sidecarPath, sidecarContent);
        }
      }

      // Copy assets if adapter wants them bundled
      copyAssets(post, adapter, outputAbsPath);

      // Write manifest sidecar
      writeManifest({
        repoRoot: REPO_ROOT,
        outputPath: outputAbsPath,
        adapter: adapter.name,
        postSlug: post.slug,
        sourceFiles: {
          body: post.bodyPath,
          frontmatter: adapterEntry.frontmatterPath,
          media: post.mediaPath,
          transcript: post.transcriptPath,
        },
        assetsReferenced: post.assets,
      });
    }
  }

  // Generate series indices for series-capable adapters
  if (allSeries.length > 0) {
    writeSeriesIndices(REPO_ROOT, allSeries, selectedAdapters);
  }

  console.log(`build: ${totalOutputs} output(s) written to dist/, ${totalErrors} error(s).`);
  if (totalErrors > 0) process.exit(1);
}

main();
