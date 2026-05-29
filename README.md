# Field Notes

> Forked from [BlogStudio](https://github.com/estevanhernandez-stack-ed/BlogStudio) — a structured AI-assisted workspace template for short-form technical/dev blogging with a vibe-coding / AI-agent lean. Run `/bootstrap` from inside Claude Code to customize this template for your blog.

A workspace for **Field Notes**, by **626 Labs**.

## Getting Started

### Option A — AI bootstrap (recommended)

1. Clone this repo. Open it in [Claude Code](https://claude.ai/claude-code).
2. Run `/bootstrap` — interactive skill asks for your blog title, author, three pillar names, primary target adapters, base URL, and license, then rewrites placeholders for you.
3. Run `npm install`. Then `npm run build` on the example post to verify the toolchain.
4. Run `/new-post` to scaffold your first post. Start writing in `body.md`.

### Option B — Manual edit

1. Replace placeholders in `CLAUDE.md` (`[YOUR BLOG TITLE]`, `[YOUR_NAME]`, `[YOUR THREE PILLARS]`).
2. Replace placeholders in this `README.md`.
3. Edit `package.json` — set `name`, `description`, `author`.
4. Adjust `00_DESIGN_SYSTEM/tokens.yaml` to your taste.
5. Run `npm install`, then `npm run build`.

See `docs/getting-started.md` for the full guided walkthrough.

## What's Inside

```text
00_DESIGN_SYSTEM/   Tokens, schemas, brand assets — visual identity for builds
01_POSTS/           Live posts (each is a directory: body.md + per-target frontmatter)
02_DRAFTS/          In-progress posts not yet built
03_ASSETS/          Images, diagrams, screenshots referenced by posts
04_MULTI_AUTHOR/    Opt-in: per-author contribution files merged into body.md
adapters/           Output adapters (markdown, hugo, ghost, substack, jekyll)
scripts/            Build, validate, compile-tokens, export
docs/               Architecture, getting-started, troubleshooting, ADRs
examples/           Test fixtures showing every feature
dist/               Generated outputs (gitignored)
```

## Write Once, Publish to N

Each post is a **directory**. The canonical content lives in `body.md`. For each target you want to publish to, you create a thin frontmatter file that includes the body:

```text
01_POSTS/2026-04-25-my-post/
├── body.md          (canonical content)
├── markdown.md      (frontmatter + {{ include "body.md" }})
├── hugo.md          (Hugo-shaped frontmatter + include)
└── ghost.md         (Ghost-shaped frontmatter + include)
```

You only create per-target files for targets you actually use. No bloat.

## Outputs

| Command | Produces |
| --- | --- |
| `npm run build` | Builds all posts to all their declared targets in `dist/<adapter>/` |
| `npm run build:adapter -- hugo` | Builds only the Hugo adapter |
| `npm run export:portable` | Plain-markdown zip archive — escape hatch from the toolchain |

Every output gets a `*.manifest.json`: timestamp, git commit, design-system version, source hashes, tool versions.

## Series Support

Series live as subdirectories under `01_POSTS/`. Each part has its own `body.md` + frontmatter files. Frontmatter declares `series:` and `series_order:`. The build generates a series index page and cross-links each part automatically.

## Custom Adapters

Built-in adapters cover markdown, Hugo, Ghost, Substack, and Jekyll. To ship a custom adapter (e.g., for a new CMS), drop a Node module into `adapters/` that exports `compile(post, designSystem)`. See `docs/adapter-authoring-guide.md`.

## Privacy

BlogStudio doesn't phone home. No telemetry. No analytics — that's your CMS's job. Build scripts run locally. Claude usage is your choice — using `/bootstrap`, `/new-post`, or merge skills sends content to Anthropic; not using them keeps everything local.

## License

[MIT](LICENSE) — change it via `/bootstrap` or by editing `LICENSE` directly.

## Credits

Template developed @ [626Labs](https://626labs.dev). Sibling templates: [WriterStudio](https://github.com/estevanhernandez-stack-ed/WriterStudio) (fiction), [ThesisStudio](https://github.com/estevanhernandez-stack-ed/ThesisStudio) (academic).
