# Architecture

How BlogStudio is structured, why it's structured that way, and what to know before extending it.

For the *decisions* behind these choices, see `docs/adr/` (Architecture Decision Records).

---

## Top-level layout

```text
BlogStudio/
├── 00_DESIGN_SYSTEM/   visual identity (tokens, schemas, compiled outputs)
├── 01_POSTS/           live posts (each is a directory: body.md + per-target frontmatter)
├── 02_DRAFTS/          in-progress posts not yet built
├── 03_ASSETS/          images, diagrams, screenshots referenced by posts
├── 04_MULTI_AUTHOR/    opt-in: per-author contribution files merged into body.md
├── adapters/           output adapters (markdown, hugo, ghost, substack, jekyll)
├── scripts/            build, validate, compile-tokens, export
├── docs/               project docs + ADRs
├── examples/           test fixtures (CI smoke-test consumers)
├── dist/               generated outputs (gitignored)
├── .claude/skills/     Claude Code skills (bootstrap, new-post, new-series, merge-authors)
├── .devcontainer/      Node + Hugo bundled
├── .github/workflows/  CI + release
└── .husky/             pre-commit + pre-push hooks
```

---

## The post-as-directory pattern

Each post in `01_POSTS/` is a directory, not a single file:

```text
01_POSTS/2026-04-26-my-post/
├── body.md         ← canonical content (no frontmatter)
├── markdown.md     ← per-target frontmatter + {{ include "body.md" }}
├── hugo.md         ← Hugo-shaped frontmatter + include
├── ghost.md        ← Ghost-shaped frontmatter + include
├── substack.md     ← Substack-shaped frontmatter + include
└── jekyll.md       ← Jekyll-shaped frontmatter + include
```

The user only creates per-target files for targets they want to publish to. A post that ships only to dev.to + a personal Hugo site needs only `markdown.md` + `hugo.md` — no bloat.

See `docs/adr/0001-per-target-source-with-include.md` for why this pattern over alternatives.

---

## Build pipeline

```text
01_POSTS/<post-dir>/                    00_DESIGN_SYSTEM/tokens.yaml
├── body.md                                       │
├── hugo.md                                       ▼
├── ghost.md                            scripts/compile-tokens.js
└── ...                                           │
       │                                          ▼
       │                              00_DESIGN_SYSTEM/compiled/
       │                              ├── tokens.css
       │                              └── tokens.json
       │                                          │
       ▼                                          │
scripts/lib/post-loader.js                        │
       │                                          │
       ▼                                          │
scripts/lib/include.js  (resolve {{ include }})   │
       │                                          │
       ▼                                          ▼
       └────────► scripts/lib/adapter-runner.js ◄─┘
                          │
            ┌─────────────┼─────────────┬──────────────┬──────────────┐
            ▼             ▼             ▼              ▼              ▼
       markdown.js    hugo.js       ghost.js     substack.js     jekyll.js
            │             │             │              │              │
            ▼             ▼             ▼              ▼              ▼
       dist/markdown/ dist/hugo/   dist/ghost/   dist/substack/  dist/jekyll/

scripts/lib/series-indexer.js  ──► dist/<adapter>/series/<series-slug>/_index.<ext>
```

Each output writes a `*.manifest.json` sidecar — timestamp, git commit, design-system version, source file SHA-256 hashes, tool versions. Reviewers (or you, six months from now) can verify exact reproducibility.

`scripts/lib/`:

- `post-loader.js` — walks `01_POSTS/`, returns structured post objects with body, adapters, media, assets
- `include.js` — resolves `{{ include "..." }}` directives; errors loudly on missing includes
- `adapter-runner.js` — loads adapter modules from `adapters/`, invokes `compile()` per post per adapter
- `series-indexer.js` — discovers series, generates index pages, injects part-N-of-M cross-links
- `manifest.js` — writes per-output manifest sidecars (uses `execFile`/`spawn` with array tokens, never shell-string concatenation)

---

## Adapter contract

Every adapter is a Node module exporting:

```javascript
module.exports.compile = function(post, designSystem) {
  return { filename, content, sidecars? };
};
module.exports.name = 'hugo';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'hugo.md';
module.exports.capabilities = { series, media, assets, syntaxHighlight };
```

The build runner auto-discovers any `.js` file in `adapters/`. Custom adapters drop in without touching core. See `docs/adapter-authoring-guide.md` for a step-by-step walkthrough.

Built-in adapters:

| Adapter | Output | Capabilities |
| --- | --- | --- |
| markdown | `dist/markdown/<slug>.md` | pass-through highlighting, no series, no media |
| hugo | `dist/hugo/<slug>/index.md` (page bundle) | series, media (shortcodes), assets bundled |
| jekyll | `dist/jekyll/_posts/YYYY-MM-DD-<slug>.md` | series, no media, external assets |
| ghost | `dist/ghost/<slug>.html` + `<slug>.ghost.json` | inline-html highlighting, media (HTML5 tags), import-JSON sidecar |
| substack | `dist/substack/<slug>.html` (inline-styled) | inline-html highlighting, no media (Substack restrictions) |

---

## Design system

`00_DESIGN_SYSTEM/tokens.yaml` is the canonical source. `scripts/compile-tokens.js` validates against schema and generates:

- `compiled/tokens.css` — CSS custom properties + Shiki-themed code-block CSS (consumed by HTML adapters and Hugo/Jekyll theme overrides)
- `compiled/tokens.json` — structured form (consumed by all adapters)

Defaults produce non-embarrassing output without modification — that's a CI smoke-test guarantee.

See `docs/adr/0002-yaml-tokens-with-compile-step.md` for why this approach.

---

## Series support

Series live as subdirectories under `01_POSTS/`:

```text
01_POSTS/my-series/
├── _index.md                ← series description (frontmatter + prose)
├── 01-intro/                ← part 1 (a normal post directory)
├── 02-deepdive/             ← part 2
└── 03-conclusion/           ← part 3
```

Each part's frontmatter declares `series: my-series` and `series_order: 1`. The build:

1. Discovers all parts via `loadAllSeries()`.
2. For adapters declaring `capabilities.series === true` (Hugo, Jekyll), generates `dist/<adapter>/series/my-series/_index.<ext>` — the series landing page.
3. Appends a "Part N of M" + Previous/Next nav block to each part's compiled output.
4. Open-ended series are supported — adding part 4 later just regenerates the indices on next build.

---

## Multi-author workflow (opt-in)

For co-authored posts, use `04_MULTI_AUTHOR/<post-slug>/` with per-author files (`author-<name>.md`). The `merge-authors` Claude skill produces `01_POSTS/<post-slug>/body.md` with HTML-comment attribution markers preserved. Build reads `body.md` (not the per-author files).

Solo posts skip this — the pattern is opt-in.

---

## Video / podcast posts

Posts may include a `media.yaml` declaring an external-host audio or video resource, plus an optional `transcript.md`. Adapters that support media (Hugo, Ghost) render the embed inline; adapters that don't (plain markdown) fall back to a link with duration label and append the transcript.

Media files live OUTSIDE the repo — `media.yaml.url` references an external host. Repo stays small.

---

## Schema validation

`00_DESIGN_SYSTEM/schemas/`:

- `tokens.schema.json` — design tokens
- `frontmatter.schema.json` — base frontmatter (extended per-target)
- `frontmatter.<adapter>.schema.json` — per-target frontmatter extensions (Hugo, Ghost, Substack, Jekyll)
- `media.schema.json` — `media.yaml` declarations
- `manifest.schema.json` — build manifests

`scripts/validate-schemas.js` discovers schema-typed files and validates each against its schema. Runs on pre-commit (lint-staged on staged files), pre-push (full repo), and CI.

---

## Where to look next

- New to BlogStudio? → `docs/getting-started.md`
- Hit an error? → `docs/troubleshooting.md`
- Want to write a custom adapter? → `docs/adapter-authoring-guide.md`
- Want to contribute? → `CONTRIBUTING.md` and `docs/contributing-guide.md`
- Curious why a decision was made? → `docs/adr/`
