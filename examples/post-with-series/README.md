# Fixture — Post with Series

Demonstrates series support: a 3-part series with `_index.md` description and per-part subdirectories. Each part has `series:` + `series_order:` frontmatter; the build's series-indexer auto-generates cross-links and a series index page.

## What's here

```text
post-with-series/
└── 01_POSTS/
    └── getting-started-with-claude-skills/
        ├── _index.md                    ← series description
        ├── 01-intro/
        │   ├── body.md
        │   └── hugo.md                  ← Hugo target (supports series)
        ├── 02-deepdive/
        │   ├── body.md
        │   └── hugo.md
        └── 03-conclusion/
            ├── body.md
            └── hugo.md
```

## What it demonstrates

- Series subdirectory pattern (`01_POSTS/<series-slug>/<NN-part-slug>/`)
- `_index.md` with series-level frontmatter
- Per-part `series:` + `series_order:` frontmatter
- Build's series indexer generates `dist/hugo/series/<series-slug>/_index.md`
- Cross-link injection: each part's compiled output gets "Previous / Next" navigation appended

## Using this fixture

Copy `01_POSTS/getting-started-with-claude-skills/` into your fork's `01_POSTS/`, then run `npm run build`. Inspect:

- `dist/hugo/01-intro/index.md`, `dist/hugo/02-deepdive/index.md`, etc. — each has a "Part N of 3" + Previous/Next nav block appended
- `dist/hugo/series/getting-started-with-claude-skills/_index.md` — the auto-generated series landing page

Series support is per-adapter — adapters declaring `capabilities.series === true` (Hugo, Jekyll) get the indexer treatment; others get plain output without navigation.
