# Contributing Guide

How to contribute back to the BlogStudio template (vs. customizing your fork).

For the lighter-weight version, see [CONTRIBUTING.md](../CONTRIBUTING.md). This file expands on the principles and walks through common contribution scenarios.

---

## What kind of contributions help?

| Contribution | Helpful? |
| --- | --- |
| Bug in a build script that all forks would hit | **Yes** — file an issue, then PR |
| New built-in adapter for a major CMS we don't ship | **Yes, with discussion** — open an issue first; significant scope |
| Improvement to an existing adapter (better Hugo shortcode rendering, Ghost theme support, etc.) | **Yes** — small PRs welcome |
| Documentation improvements (typos, missing sections, unclear explanations) | **Yes** — small PRs welcome |
| New design-system tokens (callout types, spacing variants) | **Maybe** — open an issue; balance default-richness vs. config simplicity |
| Customization specific to your blog | **No** — keep in your fork |
| Renaming the template or restructuring directories | **No without discussion** — affects every fork |

---

## Setting up for development

```bash
git clone https://github.com/estevanhernandez-stack-ed/BlogStudio.git
cd BlogStudio
npm install
```

For full build-pipeline development (Hugo preview), use the devcontainer (`.devcontainer/`). Local install of Node + Hugo works but devcontainer is faster to set up.

---

## Code style

### Scripts (`scripts/`)

- **Node.js, ES2022.** No TypeScript (low overhead matters more than typed safety here).
- **Process spawning rules.** Always use `execFile` or `spawn` with explicit argument arrays. Never use the shell-string variant — it's a command-injection risk when paths or arguments contain special characters.
- **Small, focused modules.** `scripts/lib/` holds reusable pieces; `build.js` is the thin orchestrator.
- **Honest error messages.** Surface tool stderr; don't swallow. Include install hints when a missing tool is the cause.
- **No silent fallbacks.** If a per-target frontmatter file is malformed, fail loudly with the file path — don't quietly skip it.

### Adapters (`adapters/`)

- **Match the contract** in `adapters/README.md` and `docs/adapter-authoring-guide.md`. The build runner relies on the contract; deviation breaks gracefully but isn't usable.
- **Declare capabilities accurately.** If your adapter doesn't support series, set `capabilities.series = false`. The build runner uses these for fallback decisions.
- **Per-adapter dependencies are fine.** A complex adapter can pull in its own npm deps; declare them in `package.json` so installs don't surprise.
- **HTML-emitting adapters MUST escape user content.** The substack adapter is the reference — it uses `md.utils.escapeHtml()` on code block contents. Adapter authors who emit HTML must do the same to prevent XSS in newsletter contexts.

### Markdown

- **markdownlint-cli2** validates everything. Config in `.markdownlint.json`.
- **ATX headings only** (`#`, `##`, ...) — no setext.
- **Fenced code blocks with language** when applicable.

### Schemas

- **JSON Schema draft-07.**
- **`additionalProperties: false`** on the root of every schema.
- **Pattern matching** for things like hex colors, dates, URLs. Don't accept "any string" if you mean "a hex color".

### Documentation

- **Lead with the answer.** README and getting-started should let a forking user *do something* before reading the architecture deep-dive.
- **Tables for matrices.** Per-adapter capabilities, per-feature support.
- **Concrete examples.** Show the command, show the output, show what to do next.
- **Honest limits.** If a Substack-side restriction prevents a feature, say so. Pillar 1 of the template's persona (*Runnable Truth*) applies to its own docs.

---

## Pull request process

1. **Open an issue first** for non-trivial changes. Saves both you and the maintainer time.
2. **Create a feature branch:** `git checkout -b feature/short-descriptor`
3. **Make the change** — include tests/fixtures where applicable.
4. **Validate locally:**

   ```bash
   npm run lint:md
   npm run validate
   # Build the smoke-test fixture
   cp -r examples/single-post/01_POSTS/* 01_POSTS/
   npm run build
   # Then revert: rm -rf 01_POSTS/2026-04-26-hello-vibe-coding
   ```

5. **Update docs** — if user-facing behavior changed, update `README.md`, `docs/getting-started.md`, or `docs/architecture.md` as appropriate.
6. **Update or add an ADR** for architectural changes (see `docs/adr/README.md`).
7. **Open the PR** using the template.

CI runs automatically on PR. Merge when:

- All CI checks pass
- A maintainer has reviewed and approved
- Conversations are resolved

---

## Adding a new built-in adapter

This is significant scope. Open an issue and draft an ADR before writing code. Required for the PR:

- [ ] `adapters/<name>.js` matching the adapter contract
- [ ] Per-target frontmatter schema at `00_DESIGN_SYSTEM/schemas/frontmatter.<name>.schema.json`
- [ ] Update `KNOWN_ADAPTERS` array in `scripts/lib/post-loader.js` to include the new adapter name
- [ ] At least one test fixture in `examples/` exercising the adapter
- [ ] CI workflow updated to build the smoke-test fixture for the new adapter
- [ ] ADR in `docs/adr/` documenting the decision and target's quirks
- [ ] Update `adapters/README.md`, `docs/architecture.md`, `docs/adapter-authoring-guide.md` to reference the new adapter
- [ ] Update `.claude/skills/bootstrap/SKILL.md` and `new-post/SKILL.md` to include the new adapter in the multi-select

---

## Reporting security issues

See [SECURITY.md](../SECURITY.md). Don't open public issues for security problems.

---

## Maintainer expectations

- **Response time:** Aim for ack within 5 days, substantive response within 14.
- **Communication style:** Direct. Disagreement is fine; explain it.
- **Decisions:** When a contributor proposal goes a different direction than maintainers want, we'll explain why. ADRs document the reasoning so future contributors don't re-litigate.
