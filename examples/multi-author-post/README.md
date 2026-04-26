# Fixture — Multi-Author Post

Demonstrates the file-per-author + merge pattern for collaborative posts. Two authors (Este, Jane) each draft their contributions; the `merge-authors` Claude skill produces `01_POSTS/<post-slug>/body.md` with attribution markers preserved.

## What's here

```text
multi-author-post/
├── 04_MULTI_AUTHOR/
│   └── 2026-04-26-collab-post/
│       ├── author-este.md          ← Este's contribution
│       └── author-jane.md          ← Jane's contribution
└── 01_POSTS/
    └── 2026-04-26-collab-post/
        ├── body.md                 ← merged output (with attribution)
        └── hugo.md                 ← per-target frontmatter
```

## What it demonstrates

- Per-author drafting in `04_MULTI_AUTHOR/<post-slug>/`
- Merged output in `01_POSTS/<post-slug>/body.md` with HTML-comment attribution markers
- Frontmatter `authors:` array reflecting both contributors
- The `<!-- transition? -->` flag at voice boundaries for editorial smoothing

## Trying the merge yourself

In Claude Code:

1. Delete or move `01_POSTS/2026-04-26-collab-post/body.md`.
2. Run the `merge-authors` skill on `04_MULTI_AUTHOR/2026-04-26-collab-post/`.
3. The skill regenerates `body.md` with attribution markers preserved.
