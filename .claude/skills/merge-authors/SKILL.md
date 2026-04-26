---
name: merge-authors
description: Use when a multi-author blog post needs its author-named contribution files combined into a single body.md. Preserves voice; preserves attribution markers; flags transition rough spots without smoothing them.
---

# Merge-Authors Skill — BlogStudio

You are merging two or more co-authors' contributions into a single post body. The output is a `body.md` (in `01_POSTS/<post-slug>/`) with HTML-comment attribution markers preserved. Style differences between authors are NOT smoothed — that's a separate editorial pass.

## When to use

- A user says "/merge-authors", "merge our post", "combine contributions", or similar.
- You detect a `04_MULTI_AUTHOR/<post-slug>/` directory containing two or more `author-<name>.md` files.

## Inputs

- A post slug (e.g., `2026-04-25-collab-post`).
- All `author-*.md` files in `04_MULTI_AUTHOR/<post-slug>/`.

## Output

`01_POSTS/<post-slug>/body.md` with:

- Each author's contribution combined in a sensible order (see merge logic).
- HTML comment attribution markers: `<!-- author: este -->...<!-- /author: este -->`.
- A metadata header:

  ```markdown
  <!-- merge-authors metadata
  merged_at: 2026-04-25T22:00:00Z
  authors: [este, jane]
  source_files:
    - 04_MULTI_AUTHOR/2026-04-25-collab-post/author-este.md
    - 04_MULTI_AUTHOR/2026-04-25-collab-post/author-jane.md
  -->
  ```

Also: ensure each per-target frontmatter file in `01_POSTS/<post-slug>/` has `authors: [Este, Jane]` (multi-author byline). If they don't, prompt the user to update them or offer to do it.

## Merge logic

Most blog co-author posts are short and section-based — one author writes intro+section1, the other writes section2+conclusion. Detect by heading structure.

### Case A — Sequential sections

Each author wrote different sections. Combine in heading order with attribution markers per section.

### Case B — Overlap

Authors covered the same sections. Output sequential versions with a clear "editorial reconciliation needed" note at the top. Don't AI-merge prose.

### Case C — Mixed

Section-based for non-overlapping headings; sequential listing for overlaps; note at top distinguishing regions.

## Voice preservation rules

- Don't rewrite prose to smooth stylistic transitions.
- Don't remove first-person references; different authors use them differently.
- Don't change code-block formatting, callout style, or link conventions per author.
- DO add `<!-- transition? -->` comments at heading boundaries where voices noticeably shift.

## Re-running

If `body.md` already exists, show a diff and ask before overwriting.

## After merge

Tell the user:

```text
Merge complete. Output:
  - 01_POSTS/<slug>/body.md (with attribution markers preserved)

Reminder:
  - Update each per-target frontmatter file's `authors:` array if not already
  - Consider running an editorial smoothing pass on the transitions flagged with <!-- transition? -->
  - npm run build will pick up the merged body automatically
```

## Render integration

The build pipeline reads `body.md` for each post. If a post directory has per-target frontmatter files but no `body.md`, build fails loudly. Make sure the merge produces a syntactically valid markdown file the build can ingest.
