---
name: bootstrap
description: Use when the user has just forked BlogStudio and needs to customize the template — interviews them, then rewrites placeholders across CLAUDE.md, README.md, LICENSE, package.json. Also captures default target adapters for /new-post to use later. Idempotent — safe to re-run on a customized repo.
---

# Bootstrap Skill — BlogStudio

You are helping a user customize a fresh fork of BlogStudio. Your job is to interview them through 6 fields, then rewrite template placeholders across the repo. The captured "default target adapters" are remembered so `/new-post` doesn't ask for them on every post.

## When to use

- A user says "/bootstrap", "set this up for me", "customize this template", "I just forked", "/onboard", or similar.
- You detect placeholder strings like `[YOUR BLOG TITLE]`, `[YOUR_NAME]`, `[PILLAR ONE NAME]` in `CLAUDE.md` or `README.md`.

## Detection: fresh fork vs. re-run

Check for the presence of the placeholder `[YOUR BLOG TITLE]` in `CLAUDE.md`.

- **Present** → fresh fork; ask all 6 fields with no defaults.
- **Absent** → re-run mode. For each field, read existing value and ask "keep `<X>` or overwrite?".

## Interview (one question per turn)

### 1. Blog title

> "What's the title of your blog?"

Constraints: any string. Will appear in `CLAUDE.md`, `README.md`, `LICENSE` copyright, `package.json` description, design-system `seo.site_name`.

### 2. Author name(s)

> "Who's the author? Comma-separate if multiple voices."

Constraints: at least one. Will appear in `CLAUDE.md`, `README.md`, `package.json`, `LICENSE`, default frontmatter `authors:` field.

### 3. Three pillar names

> "BlogStudio uses three pillars to define the voice. The defaults from the spec are:
>
> - **Runnable Truth** — every code snippet, command, or agent prompt actually works
> - **Earned Hook** — each post justifies itself in the opening
> - **Recognizable Voice** — there's a person behind the blog
>
> Do those land for your blog, or do you want to rename them?"

Constraints: exactly 3 names. Defaults are good for vibe-coding-leaning blogs; encourage accepting unless the user has strong opinions.

### 4. Primary target adapters (multi-select)

> "Which output targets are you publishing to? Pick any combination:
>
> - **markdown** — copy-paste to dev.to, Medium, Hashnode
> - **hugo** — Hugo static site
> - **ghost** — Ghost CMS
> - **substack** — Substack newsletter
> - **jekyll** — Jekyll static site"

Constraints: at least one. Will be saved as the default set `/new-post` uses when scaffolding new posts. Goes into `CLAUDE.md` reference architecture section as the user's "active adapters" hint.

### 5. Base URL

> "What's the base URL of your blog? (e.g., `https://blog.626labs.dev`) — used for canonical URLs in frontmatter. If you don't have one yet, just type 'tbd'."

Constraints: valid URL or 'tbd'. Will go into `seo.site_name`-adjacent config + default frontmatter `canonical_url` template.

### 6. License

> "Default is MIT. Keep it, or pick something else? (e.g., CC-BY-4.0 for written content, Apache-2.0, proprietary)"

For blogs, CC-BY-4.0 is common (content focus); MIT covers the scaffolding. If they pick a content-focused license, note that the LICENSE applies to scaffolding code AND content unless they want a separate `CONTENT-LICENSE.md`.

## Files to rewrite

| File | Replacements |
| --- | --- |
| `CLAUDE.md` | `[YOUR BLOG TITLE]`, `[YOUR_NAME]`, `[PILLAR ONE NAME]`, `[PILLAR TWO NAME]`, `[PILLAR THREE NAME]`, pillar description text, active-adapters hint |
| `README.md` | `[YOUR BLOG TITLE]`, `[YOUR_NAME]` |
| `LICENSE` | Copyright year + name (or full file replacement if non-MIT) |
| `package.json` | `name` (slugify title), `description`, `author`, `repository.url` |
| `00_DESIGN_SYSTEM/tokens.yaml` | `seo.site_name`, `seo.twitter_handle` (if user offers it), `brand.logo_path` and `brand.favicon_path` (point to `03_ASSETS/_brand/` defaults) |
| `.claude/.bootstrap-defaults.json` (NEW file) | Save `{ adapters: [...], baseUrl, authors: [...] }` for `/new-post` to consume |

## After rewrite

Show summary:

```text
Bootstrap complete. Rewrote:
  - CLAUDE.md                       (title, author, 3 pillars, active adapters)
  - README.md                       (title, author)
  - LICENSE                         (copyright year + name, MIT)
  - package.json                    (name, description, author)
  - tokens.yaml                     (site name, twitter handle if provided)
  - .claude/.bootstrap-defaults.json (new — defaults for /new-post)

Next steps:
  1. npm install
  2. Edit 00_DESIGN_SYSTEM/tokens.yaml if you want different fonts/colors/syntax theme
  3. Drop your logo + favicon into 03_ASSETS/_brand/
  4. Run /new-post to scaffold your first post
  5. npm run build to compile all posts
```

## Idempotence

Re-runs read the existing values and ask per-field "keep / overwrite". Never destructively reset without confirmation. `.bootstrap-defaults.json` is the source of truth for "what did the user pick last time."

## Manual fallback

If the user prefers manual setup, point to `README.md` § "Option B — Manual edit". Don't argue.
