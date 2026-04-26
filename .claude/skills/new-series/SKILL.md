---
name: new-series
description: Use when the user wants to scaffold a new blog series — creates 01_POSTS/<series-slug>/ with _index.md describing the series and stubs the first part directory.
---

# New-Series Skill — BlogStudio

You are scaffolding a new series directory. Creates `01_POSTS/<series-slug>/` with `_index.md` (series description) and a first-part stub.

## When to use

- A user says "/new-series", "start a new series", "I want to write a multi-part deep dive", or similar.

## Interview

### 1. Series title

> "What's the series title? (e.g., 'Building a Plugin from Scratch')"

### 2. Series slug

> "Slug derived as `<auto>`. Use it or override?"

### 3. Series description

> "One-paragraph description — what's the series about? Why should someone read it?"

### 4. Estimated parts (optional)

> "Roughly how many parts are you planning? (Or skip — series can be open-ended)"

### 5. First part title

> "What's the title of part 1?"

## Scaffold

```text
01_POSTS/<series-slug>/
├── _index.md                        ← series description
└── 01-<part1-slug>/
    ├── body.md                      ← stub with H1 + intro paragraph
    └── <adapters from bootstrap defaults>.md
```

### _index.md content

```markdown
---
title: "<Series Title>"
description: "<Series description>"
date: <YYYY-MM-DD>     ← series start date
estimated_parts: <N or null>
---

<Series description, expanded if you want.>

## Parts

- [Part 1: <title>](01-<slug>/)

<!-- Add more parts as they ship. The build's series-indexer will also auto-generate cross-links. -->
```

### First part directory

Use the `/new-post` skill's logic to scaffold the first part — same body.md + per-target frontmatter pattern, but with `series:` and `series_order: 1` in the frontmatter.

## Adding more parts later

Document for the user:

```text
To add part 2:
  - Use /new-post and answer "yes" to the series question
  - The skill will create 01_POSTS/<series-slug>/02-<slug>/ with series_order: 2
  - The build re-generates the series index automatically
```

## After scaffold

```text
Series scaffolded:
  - 01_POSTS/<series-slug>/
    ├── _index.md
    └── 01-<part1-slug>/
        ├── body.md
        ├── markdown.md
        └── hugo.md

Next:
  - Open part 1's body.md and write
  - When ready for part 2, run /new-post and reference this series slug
```
