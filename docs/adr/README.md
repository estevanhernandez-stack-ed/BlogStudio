# Architecture Decision Records

Each ADR captures a single major architectural decision with the reasoning behind it. Format follows [Michael Nygard's classic template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Why ADRs

Templates accumulate hidden decisions over time — "why each post is a directory not a file?", "why YAML tokens compiled at build time instead of CSS variables?", "why the adapter contract uses a specific signature?". Without ADRs, future maintainers reverse-engineer reasoning from git history. With them, the *why* lives next to the *what*.

## Format

Every ADR has:

- **Title** — short, action-oriented
- **Status** — Proposed / Accepted / Deprecated / Superseded by ADR-NN
- **Context** — what the situation was when the decision was made
- **Decision** — what was decided
- **Consequences** — what becomes easier or harder as a result

## Adding a new ADR

1. Pick the next number (e.g., `0006-`).
2. Use a short, action-oriented filename.
3. Follow the template format.
4. Reference the ADR from related code or PR descriptions.

## Index

| # | Title | Status |
| --- | --- | --- |
| 0001 | [Per-target source files with body include](0001-per-target-source-with-include.md) | Accepted |
| 0002 | [YAML tokens with compile step](0002-yaml-tokens-with-compile-step.md) | Accepted |
| 0003 | [Claude Code skill for bootstrap](0003-claude-skill-bootstrap.md) | Accepted |
| 0004 | [Adapter contract for output targets](0004-adapter-contract.md) | Accepted |
| 0005 | [Shiki for build-time syntax highlighting](0005-shiki-syntax-highlighting.md) | Accepted |
