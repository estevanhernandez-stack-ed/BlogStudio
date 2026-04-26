# ADR 0001 — Per-target source files with body include

**Status:** Accepted

## Context

BlogStudio publishes the same post to up to five output targets (markdown, Hugo, Ghost, Substack, Jekyll), each with different frontmatter shapes. Source-structure options:

- **A. Single source + adapters compile to all** — `posts/my-post.md` is THE source; build step generates per-target outputs.
- **B. Per-target source files sharing a content body** — each post is a directory; `body.md` holds canonical content; `<target>.md` files have target-specific frontmatter and include the body.
- **C. Single source + frontmatter switchboard** — one `.md` file with multi-target frontmatter blocks; adapters extract their slice.

## Decision

Adopted **B**. Each post is a directory under `01_POSTS/`. The directory contains `body.md` (canonical content) plus opt-in per-target frontmatter files (`markdown.md`, `hugo.md`, etc.) that include the body via a `{{ include "body.md" }}` directive.

The user only creates per-target frontmatter files for targets they actually want to publish to — no bloat for unused targets. Each per-target file is small (frontmatter block + include directive). The body is edited once and propagates everywhere.

## Consequences

**Easier:**

- Per-target frontmatter is fully expressive — Hugo gets `tags` and `categories`, Ghost gets `visibility` and `featured`, Substack gets `audience` and `subtitle`. No lossy mapping from a "common" frontmatter to per-target.
- Adding a new target adapter doesn't require changing existing posts.
- Posts can opt out of targets simply by not creating the per-target file.

**Harder:**

- Each post is a directory, not a file. Mild ergonomic cost vs. flat post files.
- Includes mean a build step is necessary to produce the final output (vs. raw markdown that could be copy-pasted directly). Mitigated: the `markdown.md` adapter target produces a copy-pastable form.
- Per-target frontmatter schemas multiply — one per adapter. Maintained in `00_DESIGN_SYSTEM/schemas/frontmatter.<target>.schema.json`.

Approved.
