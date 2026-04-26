# Adapter Authoring Guide

How to ship a custom adapter for a CMS or output target BlogStudio doesn't have built in.

If you want to publish to Bear, Mataroa, your in-house wiki, an internal documentation system, or any other markdown/HTML-accepting destination, write an adapter. The contract is small enough to read in one sitting.

---

## What an adapter is

A Node module that takes a post + the design system and returns a `{ filename, content }` (plus optional `sidecars`).

That's it. No lifecycle hooks, no plugin system, no inheritance. The build runner discovers any `.js` file in `adapters/`, validates it matches the contract, and invokes its `compile()` function for each post that has a matching per-target frontmatter file.

---

## The minimum adapter

```javascript
// adapters/myblog.js

module.exports.name = 'myblog';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'myblog.md';
module.exports.capabilities = {
  series: false,
  media: false,
  assets: 'external',
  syntaxHighlight: 'pass-through',
};

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'myblog');
  if (!adapterEntry) {
    throw new Error('myblog adapter invoked but no myblog.md frontmatter found');
  }

  const fm = adapterEntry.frontmatter;
  const slug = fm.slug || post.cleanSlug || post.slug;

  // Whatever transformation your target needs:
  const content = `---\n${stringifyFrontmatter(fm)}---\n\n${post.bodyContent}`;

  return {
    filename: `${slug}.md`,
    content,
  };
};

function stringifyFrontmatter(fm) {
  return Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') + '\n';
}
```

Drop this file in `adapters/`. Add a `myblog.md` to any post directory. Run `npm run build`. The new adapter shows up in `dist/myblog/`.

---

## The full contract

```javascript
/**
 * @param {object} post - loaded post object
 * @param {string} post.bodyContent - the resolved body markdown (includes already processed)
 * @param {string} post.slug - directory name (may include date prefix)
 * @param {string} post.cleanSlug - directory name with leading YYYY-MM-DD- stripped
 * @param {Array<{name, frontmatter, frontmatterPath, raw, resolvedBody}>} post.adapters
 *        — one entry per per-target frontmatter file present in the post directory
 * @param {object|null} post.media - parsed media.yaml if present
 * @param {string|undefined} post.transcriptPath - absolute path to transcript.md if present
 * @param {string[]} post.assets - relative asset paths referenced by the body
 *
 * @param {object} designSystem
 * @param {object} designSystem.tokens - parsed tokens.yaml
 * @param {object} designSystem.compiled - { json: structured tokens, css: compiled CSS string }
 *
 * @returns {{ filename: string, content: string, sidecars?: Record<string, string> }}
 *   - filename: path relative to dist/<adapter-name>/ (may include subdirectories)
 *   - content: file content
 *   - sidecars: optional additional files to write next to the main output
 */
module.exports.compile = function (post, designSystem) { ... };

/** Adapter identifier — also used as dist subdirectory name */
module.exports.name = 'myblog';

/** Default output file extension */
module.exports.outputExtension = '.md';

/** Filename in post directories that signals this adapter should run */
module.exports.frontmatterFile = 'myblog.md';

/** Capability flags — used by build runner for fallback behavior */
module.exports.capabilities = {
  series: true | false,                         // Can generate series index pages?
  media: true | false,                          // Handles video/podcast embeds?
  assets: 'bundled' | 'external' | 'inline',   // How are referenced assets handled?
  syntaxHighlight: 'theme-css' | 'inline-html' | 'pass-through',
};
```

---

## Capability flags explained

### `series`

If `true`, the build runner:

- Generates `dist/<adapter>/series/<series-slug>/_index.<ext>` for each series
- Appends a "Part N of M" + Previous/Next nav block to each series part's output

If `false`, series posts are compiled as standalone outputs without nav.

### `media`

If `true`, when a post has `media.yaml`, the adapter is responsible for rendering the audio/video reference appropriately for its target. See `adapters/hugo.js` (uses Hugo shortcodes) for the reference implementation.

If `false`, media-bearing posts compile but the embed is dropped (or rendered as a link, depending on adapter).

### `assets`

- `'bundled'` — assets get copied into the output dir (adapter's choice of layout)
- `'external'` — references stay as-is; the user uploads assets separately
- `'inline'` — assets get base64-inlined into the content (rare; useful for fully self-contained HTML)

The build runner's `copyAssets()` helper handles the `'bundled'` case for you.

### `syntaxHighlight`

- `'pass-through'` — fenced code blocks remain as fenced markdown; downstream tool handles highlighting
- `'theme-css'` — adapter emits theme-aware CSS classes; downstream stylesheet renders them
- `'inline-html'` — adapter pre-renders code blocks to HTML with inline styles or pre-styled tags

---

## Per-target frontmatter schema

Every adapter should have a corresponding `00_DESIGN_SYSTEM/schemas/frontmatter.<adapter-name>.schema.json` that:

1. Extends the base `frontmatter.schema.json` via `allOf` + `$ref`
2. Adds adapter-specific fields the user might use

This lets `npm run validate` catch typos in your users' per-target frontmatter at edit time, not at build time.

See `00_DESIGN_SYSTEM/schemas/frontmatter.hugo.schema.json` as the reference.

---

## Testing your adapter

1. Create a test fixture in `examples/<adapter-name>/01_POSTS/test-post/` with `body.md` + `<adapter-name>.md`.
2. Copy the fixture into the parent's `01_POSTS/` for a local smoke test.
3. Run `npm run build:adapter -- <adapter-name>`.
4. Inspect `dist/<adapter-name>/` for the output.
5. Revert the smoke-test copy.

If you're contributing the adapter back to the upstream BlogStudio, your PR should include the fixture + a CI workflow update that builds it.

---

## Common patterns

### Markdown-to-HTML rendering

If your target consumes HTML (like Ghost), use `markdown-it` (already a dep) to render the body:

```javascript
const markdownIt = require('markdown-it');
const md = markdownIt({ html: true, linkify: true });
const html = md.render(post.bodyContent);
```

For syntax highlighting, see the substack adapter for inline styling, or extend `markdown-it` with `markdown-it-shiki` for build-time highlighting.

### Sidecar files

Some targets need additional files alongside the main output (Ghost wants an import-JSON envelope). Use the `sidecars` field in the return:

```javascript
return {
  filename: `${slug}.html`,
  content: html,
  sidecars: {
    [`${slug}.import.json`]: JSON.stringify(importEnvelope, null, 2),
  },
};
```

The build runner writes each sidecar next to the main output.

### Date handling

Frontmatter `date` is always a string (per the schema). Parse it with `new Date(fm.date)` when you need a Date object.

### Slug fallback

Use `fm.slug || post.cleanSlug || post.slug` to derive your output filename. This honors the user's explicit override, falls back to the date-stripped directory name, then the raw directory name.

---

## Publishing your adapter

If your adapter has broad utility (a major CMS), consider contributing it back to BlogStudio. Open an issue first; see `docs/contributing-guide.md` § "Adding a new built-in adapter".

If your adapter is specific to your stack, keep it in your fork. The contract is stable — your custom adapter won't break across BlogStudio versions unless we bump the contract major version (which we'd document with a deprecation cycle).
