# Fixture — Single Post

Self-contained sample post with all 5 adapter frontmatter files. Used by CI as the smoke-test build target.

## What's here

```text
single-post/
└── 01_POSTS/
    └── 2026-04-26-hello-vibe-coding/
        ├── body.md         ← canonical content (no frontmatter)
        ├── markdown.md     ← plain markdown adapter target
        ├── hugo.md         ← Hugo page bundle target
        ├── ghost.md        ← Ghost CMS target
        ├── substack.md     ← Substack newsletter target
        └── jekyll.md       ← Jekyll static site target
```

## What it demonstrates

- Per-target frontmatter + body include pattern (one body.md, N opt-in target frontmatter files)
- The body shape: H1 + opening hook + sections with code blocks + outbound links
- Frontmatter shaped appropriately per target (Hugo's `categories`, Ghost's `status` + `visibility`, Substack's `subtitle` + `audience`, Jekyll's `layout`)
- The "Earned Hook" pillar — the post justifies itself in the opening sentences

## Using this fixture

Copy `01_POSTS/2026-04-26-hello-vibe-coding/` into your fork's `01_POSTS/`, then run `npm run build` to compile to all 5 adapters in `dist/`.

CI uses this fixture for the smoke-test build on every PR — see `.github/workflows/ci.yml`.
