# ADR 0003 — Claude Code skill as the primary bootstrap UX

**Status:** Accepted

## Context

After fork, the user replaces `[YOUR BLOG TITLE]`, `[YOUR_NAME]`, three pillar names, primary target adapters, base URL, license fields. Same UX-delivery options considered as ThesisStudio (manual edit / bootstrap script / Claude skill).

Mirrors ThesisStudio's ADR 0004 — same stance, same trade-offs, with one BlogStudio-specific addition: the bootstrap skill captures the user's default target adapters and writes them to `.claude/.bootstrap-defaults.json` so `/new-post` can use them without re-asking on every post.

## Decision

Adopted **Claude Code skill** at `.claude/skills/bootstrap/SKILL.md`. Manual-edit fallback documented in `README.md`. Bootstrap defaults file (`.claude/.bootstrap-defaults.json`) is the source of truth for what `/new-post` should scaffold.

## Consequences

**Easier:**

- Same as ThesisStudio: low-friction onboarding, idempotent re-runs.
- `/new-post` becomes near-zero-friction because adapters are already known.
- Vibe-coding stance is reinforced — the template is AI-native end-to-end.

**Harder:**

- Same as ThesisStudio: manual fallback must stay first-class. Bootstrap defaults file is an additional thing to keep schema-stable.
- Re-running bootstrap with different adapter selections doesn't retroactively scaffold per-target frontmatter for existing posts. The user does that manually (or via a future `/migrate-post` skill).

Approved with the constraint: manual fallback always documented and tested.
