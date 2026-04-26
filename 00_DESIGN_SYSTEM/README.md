# 00_DESIGN_SYSTEM

The visual identity for your blog. One source of truth (`tokens.yaml`), compiled at build time into per-format style files that adapters consume.

## Structure

| Path | Purpose |
| --- | --- |
| `tokens.yaml` | Canonical design tokens — typography, colors, spacing, code-block syntax theme, callouts, brand assets. Edit this. |
| `schemas/` | JSON Schema files validating tokens.yaml, frontmatter (per-target), media.yaml, build manifests. |
| `compiled/` | Generated at build time (gitignored) — `tokens.css` (for Hugo/Jekyll/Ghost theme overrides), `tokens.json` (adapter consumption). |

## Workflow

1. Edit `tokens.yaml`.
2. Run `npm run compile:tokens` (or `npm run build` — the build compiles tokens automatically).
3. Compiled outputs feed into adapters: Hugo and Jekyll embed CSS into theme overrides; Ghost uses card-level CSS; Substack applies what it can (mostly typography).

## Defaults

Ships with non-embarrassing defaults — Inter typography, GitHub Dark code-block theme via Shiki, conservative color palette with a vibe-coding-friendly accent. Render the example post without touching this file to see what defaults produce.

## Adapter applicability

| Adapter | Tokens applied |
| --- | --- |
| `markdown` | None (target tools handle their own styling) |
| `hugo` | Full — via theme config + shortcode CSS |
| `jekyll` | Full — via theme overrides |
| `ghost` | Card-level — Ghost has theme constraints |
| `substack` | Partial — Substack styling is mostly locked |

## Validation

`tokens.yaml` is schema-validated by `npm run validate` and pre-commit hooks.
