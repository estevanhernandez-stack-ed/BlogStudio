#!/usr/bin/env node
/**
 * export-portable.js — produce a markdown-only zip archive of the blog source.
 *
 * The escape hatch from the toolchain. A user can leave BlogStudio at any time
 * with their work intact: all body.md files, per-target frontmatter, assets, design tokens,
 * and a README explaining the structure.
 *
 * Output: dist/portable/blog-archive.zip
 *
 * Does NOT include compiled outputs in dist/<adapter>/ — those are derivative.
 * Does NOT include node_modules, .git, .devcontainer.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'dist', 'portable');

function archiveName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    return (pkg.name || 'blog-studio').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  } catch {
    return 'blog-studio';
  }
}

const INCLUDE_PATHS = [
  '01_POSTS',
  '02_DRAFTS',
  '03_ASSETS',
  '04_MULTI_AUTHOR',
  '00_DESIGN_SYSTEM/tokens.yaml',
  'CLAUDE.md',
  'README.md',
];

const SKIP_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /compiled\//,
  /\bdist\b/,
  /\.gitkeep$/,
];

function walk(absPath, results = []) {
  if (!fs.existsSync(absPath)) return results;
  const stat = fs.statSync(absPath);
  if (stat.isFile()) {
    results.push(absPath);
    return results;
  }
  for (const entry of fs.readdirSync(absPath, { withFileTypes: true })) {
    const full = path.join(absPath, entry.name);
    if (SKIP_PATTERNS.some((re) => re.test(full))) continue;
    if (entry.isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

function buildPortableReadme(name) {
  return `# ${name} — Portable Export

This is a markdown-only archive of your blog. The toolchain (Node scripts, adapters,
design system compilers, Shiki) is NOT included — only the source content.

## What's here

| Path | Contents |
| --- | --- |
| 01_POSTS/ | All published posts (each is a directory: body.md + per-target frontmatter) |
| 02_DRAFTS/ | In-progress posts |
| 03_ASSETS/ | Images, diagrams, screenshots referenced by posts |
| 04_MULTI_AUTHOR/ | Per-author contribution files (if any multi-author posts) |
| 00_DESIGN_SYSTEM/tokens.yaml | Your visual design tokens |
| CLAUDE.md | Persona pillars + editorial stance |
| README.md | Original BlogStudio README |

## What's NOT here

- Generated outputs in dist/<adapter>/ — derivative, can be re-built from source
- node_modules, .git, build infrastructure
- The adapter modules and build scripts

## Re-importing

To go back to a full BlogStudio workflow with this content:

1. Fork [BlogStudio](https://github.com/estevanhernandez-stack-ed/BlogStudio) fresh.
2. Copy these files into the matching paths in your fork.
3. \`npm install\` and continue from there.

## Posting from this archive (no toolchain)

Each post directory has body.md (canonical content) and optionally per-target
frontmatter files (markdown.md, hugo.md, ghost.md, etc.). Without the build
toolchain, you can:

- Open body.md and copy-paste into any markdown editor or CMS
- The per-target frontmatter files include the body via \`{{ include "body.md" }}\` —
  manually inline body.md content where the directive appears, then publish to that target
`;
}

function main() {
  const name = archiveName();
  const stagingDir = path.join(OUT_DIR, name);
  const zipPath = path.join(OUT_DIR, `${name}.zip`);

  if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });

  let fileCount = 0;
  for (const inc of INCLUDE_PATHS) {
    const src = path.join(REPO_ROOT, inc);
    if (!fs.existsSync(src)) continue;
    const files = walk(src);
    for (const file of files) {
      const rel = path.relative(REPO_ROOT, file);
      const dst = path.join(stagingDir, rel);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(file, dst);
      fileCount += 1;
    }
  }

  fs.writeFileSync(path.join(stagingDir, 'PORTABLE_README.md'), buildPortableReadme(name));

  if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
  try {
    execFileSync('zip', ['-r', `${name}.zip`, name], { cwd: OUT_DIR, stdio: 'inherit' });
  } catch (e) {
    console.error('zip command failed. On Windows, install Git Bash or WSL, or use 7-Zip manually.');
    console.error(`Staging directory ready at: ${stagingDir}`);
    process.exit(1);
  }

  fs.rmSync(stagingDir, { recursive: true, force: true });

  console.log(`export-portable: wrote ${zipPath}`);
  console.log(`  ${fileCount} source file(s) packaged`);
}

main();
