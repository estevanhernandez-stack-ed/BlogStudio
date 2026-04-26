# Getting Started

Fork-to-first-post walkthrough. Target: shipping your first post in **30 minutes**.

---

## 1. Fork and clone

```bash
gh repo fork estevanhernandez-stack-ed/BlogStudio --clone
cd BlogStudio
```

Or click "Use this template" on GitHub, then `git clone` your new repo.

---

## 2. Bootstrap

### Option A — AI bootstrap (recommended; ~3 min)

Open the repo in [Claude Code](https://claude.ai/claude-code). Run:

```text
/bootstrap
```

The skill asks:

1. Blog title
2. Author name(s)
3. Three pillar names (defaults: *Runnable Truth* / *Earned Hook* / *Recognizable Voice* — accept unless you have strong opinions)
4. Primary target adapters (multi-select: markdown, hugo, ghost, substack, jekyll)
5. Base URL
6. License (default: MIT)

It rewrites placeholders across `CLAUDE.md`, `README.md`, `LICENSE`, `package.json`, and `00_DESIGN_SYSTEM/tokens.yaml`. Captures default adapters in `.claude/.bootstrap-defaults.json` so `/new-post` doesn't ask again. Idempotent.

### Option B — Manual edit (~10 min)

If you don't use Claude Code:

1. Open `CLAUDE.md`. Replace `[YOUR BLOG TITLE]`, `[YOUR_NAME]`, three `[PILLAR NAME]` fields, the editorial-stance section if your blog isn't AI/vibe-coding-leaning.
2. Open `README.md`. Replace title and author placeholders.
3. Open `LICENSE`. Update copyright year and name.
4. Open `package.json`. Update `name`, `description`, `author`.
5. Open `00_DESIGN_SYSTEM/tokens.yaml`. Set `seo.site_name` to your blog name.

---

## 3. Install

```bash
npm install
```

Installs dev dependencies + Husky pre-commit hooks.

For Hugo preview, install Hugo Extended locally OR use the devcontainer (Node + Hugo bundled).

---

## 4. Verify the toolchain

```bash
npm run compile:tokens
npm run validate
```

Should both report clean. If validation fails, the error includes the file path and the failing field.

---

## 5. Scaffold your first post

### Option A — `/new-post` (recommended)

In Claude Code:

```text
/new-post
```

The skill asks for: title, slug, tags, description, optional series. Uses the adapters captured at `/bootstrap` time. Scaffolds `01_POSTS/YYYY-MM-DD-<slug>/` with `body.md` + per-target frontmatter files.

### Option B — Copy from the example

```bash
cp -r examples/single-post/01_POSTS/2026-04-26-hello-vibe-coding 01_POSTS/YYYY-MM-DD-my-first-post
```

Edit the frontmatter files (titles, dates, slugs) and overwrite `body.md` with your content.

---

## 6. Write

Open `01_POSTS/YYYY-MM-DD-my-first-post/body.md`. Write the post.

Pillar 2 (*Earned Hook*) reminder: the title's promise should be paid off in the first 3 sentences. Reader should know exactly why this post exists by then.

---

## 7. Build

```bash
npm run build
```

Produces outputs in `dist/<adapter>/`. For example, with markdown + hugo + ghost adapters declared in your post:

```text
dist/markdown/my-first-post.md
dist/hugo/my-first-post/index.md
dist/ghost/my-first-post.html
dist/ghost/my-first-post.ghost.json
```

Each gets a sibling `*.manifest.json` for reproducibility.

---

## 8. Publish

| Adapter | Where to upload |
| --- | --- |
| markdown | Copy-paste into dev.to / Medium / Hashnode editors |
| hugo | Copy `dist/hugo/<slug>/` into your Hugo site's `content/posts/` |
| jekyll | Copy `dist/jekyll/_posts/<file>` into your Jekyll site's `_posts/` |
| ghost | Use Ghost's import feature with the `.ghost.json` sidecar; or paste the HTML into the Ghost editor |
| substack | Paste the HTML into Substack's editor; publish/email-send from there |

---

## What's next

- **Series of posts?** → `docs/architecture.md` § Series support
- **Co-authoring?** → `04_MULTI_AUTHOR/README.md`
- **Video / podcast posts?** → see `examples/video-podcast-post/`
- **Custom adapter for a CMS we don't ship?** → `docs/adapter-authoring-guide.md`
- **Customizing visual identity?** → `00_DESIGN_SYSTEM/README.md`
- **Hit a bug?** → `docs/troubleshooting.md` first; then [open an issue](https://github.com/estevanhernandez-stack-ed/BlogStudio/issues/new/choose)

---

## The 30-minute checkpoint

If you're past 30 min and haven't shipped, something's blocking. Common culprits:

- Stuck on bootstrap field decisions → accept defaults, refine later by re-running `/bootstrap`
- Schema validation errors on dates → quote them in YAML: `date: "2026-04-26"` not `date: 2026-04-26`
- Build errors on adapter file present without body.md → make sure every post directory has `body.md`
- Hugo preview not working → use the devcontainer instead of installing Hugo locally

Templates exist to get out of your way. If something's slowing you down, file an issue — that's a template bug.
