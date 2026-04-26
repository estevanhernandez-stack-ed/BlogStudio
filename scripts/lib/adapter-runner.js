/**
 * adapter-runner.js — load adapter modules from adapters/, invoke each
 * adapter's compile() for posts that have a matching per-target frontmatter file.
 *
 * Adapter contract (see adapters/README.md):
 *   module.exports.compile = function(post, designSystem) -> { filename, content, sidecars? }
 *   module.exports.name           = string
 *   module.exports.outputExtension = string
 *   module.exports.frontmatterFile = string
 *   module.exports.capabilities    = { series, media, assets, syntaxHighlight }
 */

const fs = require('fs');
const path = require('path');

function loadAdapters(repoRoot) {
  const adaptersDir = path.join(repoRoot, 'adapters');
  if (!fs.existsSync(adaptersDir)) return [];
  const adapters = [];
  for (const entry of fs.readdirSync(adaptersDir)) {
    if (!entry.endsWith('.js')) continue;
    const adapterPath = path.join(adaptersDir, entry);
    let mod;
    try {
      // Clear require cache so re-runs in the same process pick up adapter edits
      delete require.cache[require.resolve(adapterPath)];
      mod = require(adapterPath);
    } catch (e) {
      console.error(`adapter-runner: failed to load ${entry}: ${e.message}`);
      continue;
    }
    if (typeof mod.compile !== 'function' || !mod.name) {
      console.error(`adapter-runner: ${entry} does not match adapter contract (missing compile or name).`);
      continue;
    }
    adapters.push(mod);
  }
  return adapters;
}

/**
 * Run one adapter for one post.
 * Returns { filename, content, sidecars? } from adapter.compile() or null on error.
 */
function runAdapter(adapter, post, designSystem) {
  try {
    const result = adapter.compile(post, designSystem);
    if (!result || !result.filename || result.content == null) {
      throw new Error(`compile() returned invalid result (missing filename or content)`);
    }
    return result;
  } catch (e) {
    console.error(`adapter-runner: adapter ${adapter.name} failed on post ${post.slug}: ${e.message}`);
    return null;
  }
}

/**
 * Find the adapter that handles a given per-target frontmatter file name (e.g., 'hugo' for 'hugo.md').
 */
function findAdapterByName(adapters, name) {
  return adapters.find((a) => a.name === name);
}

module.exports = { loadAdapters, runAdapter, findAdapterByName };
