# 03_ASSETS

Images, diagrams, screenshots referenced by posts.

## Structure

Per-post asset subdirectories:

```text
03_ASSETS/
├── 2026-04-25-my-post/
│   ├── hero.png
│   ├── diagram.svg
│   └── screenshot.png
└── _brand/
    ├── logo.svg
    ├── favicon.png
    └── og-default.png
```

## Referencing in posts

From a post's `body.md`, reference assets via relative path:

```markdown
![Architecture diagram](../../03_ASSETS/2026-04-25-my-post/diagram.svg)
```

## Adapter behavior

- **Hugo**: Assets are copied into the page bundle (`dist/hugo/<slug>/`) so they ship alongside the post.
- **Jekyll**: Assets are copied to `dist/jekyll/assets/<slug>/`; references rewritten to point there.
- **Ghost / Substack**: Assets need to be uploaded to the platform; the build produces a list of assets per post in the manifest, but doesn't auto-upload.
- **Markdown**: Asset references stay as-is; downstream tool resolves them.

## Brand assets

Shared brand assets live in `_brand/` (logo, favicon, default OpenGraph image). Referenced by `00_DESIGN_SYSTEM/tokens.yaml` and used across posts.
