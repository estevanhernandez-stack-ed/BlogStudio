# ADR 0002 — YAML design tokens compiled at build time

**Status:** Accepted

## Context

The design system needs ONE source of truth producing per-format styling outputs (CSS for Hugo/Jekyll/Ghost theme overrides, JSON for adapter consumption). Same considerations as ThesisStudio's equivalent ADR 0003: JSON vs YAML vs TOML vs CSS vars vs per-format files.

Aligned with ThesisStudio for cross-template consistency — a user moving between siblings shouldn't re-learn the design system.

## Decision

Adopted **YAML canonical, compiled at build time** to `compiled/tokens.css` and `compiled/tokens.json`. Compile lives in `scripts/compile-tokens.js`.

YAML's comments matter for documenting non-obvious choices ("syntax theme github-dark because it matches my IDE"). Adapter consumption goes through `tokens.json` (deterministic structured form); HTML-emitting adapters can also drop in `tokens.css` directly when their target supports custom CSS.

## Consequences

**Easier:**

- One file to edit when changing visual identity across all adapters.
- Schema validation catches typos at edit time.
- Cross-template consistency with ThesisStudio reduces cognitive load when working across sibling repos.

**Harder:**

- Build step required before any rendered output. Mitigated by `npm run build` auto-running `compile:tokens` first.
- Users wanting fine-grained per-target CSS overrides must know `compiled/tokens.css` is generated, not source. Documented in `00_DESIGN_SYSTEM/README.md`.

Approved.
