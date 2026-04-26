# ADR 0005 — Shiki for build-time syntax highlighting

**Status:** Accepted

## Context

Code blocks are a load-bearing part of a dev blog. Pillar 1 ("Runnable Truth") demands they look right and read clearly. Highlighting options:

- **Build-time highlighting (Shiki)** — render code to themed HTML during build; output ships pre-highlighted; no client-side JS needed.
- **Client-side highlighting (Prism, highlight.js)** — ship raw code; viewer's browser does highlighting.
- **Pass-through to target's highlighter** — emit fenced code; let Hugo/Ghost/Jekyll do their thing.

## Decision

Adopted **Shiki** for HTML-emitting adapters (Ghost, Substack, anywhere we render to HTML). Markdown-emitting adapters (markdown, Hugo, Jekyll) pass through fenced code so the target's highlighter handles it (Hugo's Chroma, Jekyll's Rouge — both excellent).

Shiki was chosen over Prism/highlight.js because:

- It uses VS Code's TextMate grammars — virtually any language a user writes about will highlight correctly.
- Theme catalog matches editor themes users actually run (github-dark, dracula, one-dark-pro, nord).
- Zero runtime JS needed in the published HTML — important for newsletter targets like Substack where JS is stripped.

The chosen Shiki theme is captured in `00_DESIGN_SYSTEM/tokens.yaml` `code_blocks.syntax_theme`.

## Consequences

**Easier:**

- Code blocks look right in newsletter HTML where client-side JS doesn't run.
- Theme matches what the writer uses in their editor — visual continuity.
- No accessibility regressions from JS-dependent highlighting.

**Harder:**

- Build time grows slightly (Shiki loads grammars per language). Mitigated by lazy-loading only the languages used in posts.
- Switching themes requires a rebuild. For HTML adapters this is the cost of build-time highlighting.
- Pass-through adapters (Hugo, Jekyll) don't honor the design-system theme — they use the target's highlighter. Documentation in `00_DESIGN_SYSTEM/README.md` is explicit about this.

Approved. Future evolution: a `theme_per_target` override in tokens.yaml could let HTML adapters use a different theme than what gets emitted to Hugo's Chroma.
