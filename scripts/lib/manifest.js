/**
 * manifest.js — write per-output manifest sidecars for build artifacts.
 *
 * Output schema validated against 00_DESIGN_SYSTEM/schemas/manifest.schema.json.
 *
 * Captures: build timestamp, git commit (and dirty flag), adapter name,
 * design-system version, post slug, source files + SHA-256 hashes,
 * tool versions, asset references.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

function sha256(filePath) {
  const data = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
}

function gitInfo(repoRoot) {
  try {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return { commit, dirty: status.length > 0 };
  } catch {
    return { commit: 'uncommitted', dirty: true };
  }
}

function toolVersions(extras = {}) {
  return { node: process.version.replace(/^v/, ''), ...extras };
}

function readDesignSystemVersion(repoRoot) {
  try {
    const tokensPath = path.join(repoRoot, '00_DESIGN_SYSTEM', 'tokens.yaml');
    const yaml = require('js-yaml');
    const tokens = yaml.load(fs.readFileSync(tokensPath, 'utf8'));
    return tokens.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Write a manifest sidecar.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {string} opts.outputPath - the rendered file's path; manifest written next to it as <outputPath>.manifest.json
 * @param {string} opts.adapter - adapter name (matches adapters/<name>.js)
 * @param {string} opts.postSlug - the post slug
 * @param {object} opts.sourceFiles - { body, frontmatter, media?, transcript? }
 * @param {string[]} opts.assetsReferenced - asset paths referenced by the post
 * @param {object} opts.toolExtras - additional tool version info (e.g., shiki version)
 */
function writeManifest({ repoRoot, outputPath, adapter, postSlug, sourceFiles, assetsReferenced, toolExtras }) {
  const git = gitInfo(repoRoot);
  const sourceHashes = {};
  for (const [k, v] of Object.entries(sourceFiles)) {
    if (v && fs.existsSync(v)) {
      sourceHashes[k] = sha256(v);
    }
  }

  const manifest = {
    built_at: new Date().toISOString(),
    git_commit: git.commit,
    git_dirty: git.dirty,
    adapter,
    design_system_version: readDesignSystemVersion(repoRoot),
    post_slug: postSlug,
    source_files: Object.fromEntries(
      Object.entries(sourceFiles)
        .filter(([, v]) => v && fs.existsSync(v))
        .map(([k, v]) => [k, path.relative(repoRoot, v).replace(/\\/g, '/')])
    ),
    source_hashes: sourceHashes,
    tool_versions: toolVersions(toolExtras || {}),
    assets_referenced: assetsReferenced || [],
  };

  const manifestPath = outputPath + '.manifest.json';
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

module.exports = { writeManifest };
