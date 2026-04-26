# Multi-Author (opt-in)

Co-authoring a post? Use this directory pattern to keep contributions traceable.

## Pattern

For each multi-author post, create a subdirectory mirroring the post's slug:

```text
04_MULTI_AUTHOR/
└── 2026-04-25-collab-post/
    ├── author-este.md          ← Este's contribution
    └── author-jane.md          ← Jane's contribution
```

When ready to combine, run the `merge-authors` Claude skill — it produces `01_POSTS/2026-04-25-collab-post/body.md` with HTML-comment attribution markers preserved.

## After merge

The merged `body.md` is what the build uses. Per-target frontmatter files (`hugo.md`, `ghost.md`, etc.) declare `authors: [Este, Jane]` so the byline shows both names.

## Solo authors

Skip this directory. Solo posts go directly into `01_POSTS/<slug>/`.

## Editorial smoothing

The merge skill preserves voice deliberately. Stylistic transitions between authors will read as discontinuities — that's intentional. Smoothing is a separate editorial pass after merge.
