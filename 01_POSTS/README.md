# 01_POSTS

Live posts. Each post is a **directory**, not a single file. The canonical content lives in `body.md`; per-target frontmatter files (one per output adapter the post targets) include the body.

## Structure

```text
01_POSTS/
├── 2026-04-25-my-first-post/
│   ├── body.md                  ← canonical content (no frontmatter)
│   ├── markdown.md              ← targets plain markdown
│   ├── hugo.md                  ← targets Hugo
│   ├── ghost.md                 ← targets Ghost
│   ├── substack.md              ← targets Substack
│   └── jekyll.md                ← targets Jekyll
└── my-series/                   ← series subdirectory
    ├── _index.md                ← series description
    ├── 01-intro/
    │   ├── body.md
    │   └── hugo.md
    ├── 02-deepdive/
    │   └── ...
    └── 03-conclusion/
        └── ...
```

## Per-target frontmatter file pattern

A target frontmatter file is small — frontmatter block + an include directive:

```markdown
---
title: "My First Post"
date: 2026-04-25
tags: ["ai", "vibe-coding"]
---

{{ include "body.md" }}
```

You only create per-target files for the targets you want to publish to. A post that only ships to dev.to needs only `markdown.md`. The build only produces outputs for the per-target files present.

## Naming

Recommended: `YYYY-MM-DD-<slug>/` for chronological browsing. The build uses the date from frontmatter, not the directory name — so renaming directories is safe.

## Series

Series live as subdirectories. See `_index.md` inside any series dir for the series description; each part has its own subdirectory with `body.md` + per-target files. Each part's frontmatter declares `series:` and `series_order:`. The build generates the series index and cross-links each part automatically.

## Scaffolding new posts

Use `/new-post` (Claude skill) for a guided scaffold. Or copy `examples/single-post/` and modify.
