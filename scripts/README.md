# scripts/

Build, validation, and utility scripts. Invoked via `npm run <name>` (see `package.json`).

## Scripts (populated as the build progresses)

| Script | npm command | Purpose |
| --- | --- | --- |
| `build.js` | `npm run build` | Main build — discovers posts, runs adapters, writes `dist/` outputs |
| `build.js --adapter <name>` | `npm run build:adapter -- hugo` | Build only the specified adapter |
| `compile-tokens.js` | `npm run compile:tokens` | `tokens.yaml` → `tokens.css`, `tokens.json` (with Shiki theme baked in) |
| `validate-schemas.js` | `npm run validate` | JSON Schema validation across the repo |
| `check-links.js` | `npm run check:links` | Internal link validation across `dist/` |
| `export-portable.js` | `npm run export:portable` | Markdown-only zip archive — escape hatch from the toolchain |

## Shared library

`scripts/lib/` holds reusable modules:

| Module | Purpose |
| --- | --- |
| `post-loader.js` | Walks `01_POSTS/`, returns structured post objects |
| `include.js` | Resolves `{{ include "..." }}` directives in per-target frontmatter files |
| `adapter-runner.js` | Invokes each adapter; surfaces per-adapter errors without aborting whole build |
| `series-indexer.js` | Discovers series; generates index pages and cross-links |
| `manifest.js` | Writes per-output `*.manifest.json` with reproducibility data |

## Safety

All shell-out calls use `execFile` / `spawn` with explicit argument arrays — never `exec` with string concatenation.
