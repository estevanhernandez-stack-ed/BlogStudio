# adapters/

Output adapters — Node modules that compile a post + design system into target-specific output.

## Built-in adapters (populated as the build progresses)

| File | Targets | Output |
| --- | --- | --- |
| `markdown.js` | dev.to, Medium, Hashnode, plain markdown | `dist/markdown/<slug>.md` |
| `hugo.js` | Hugo static sites | `dist/hugo/<slug>/index.md` (page bundle) |
| `jekyll.js` | Jekyll static sites | `dist/jekyll/_posts/YYYY-MM-DD-<slug>.md` |
| `ghost.js` | Ghost CMS | `dist/ghost/<slug>.html` + `<slug>.ghost.json` |
| `substack.js` | Substack | `dist/substack/<slug>.html` (inline-styled) |

## Adapter contract

Every adapter exports:

```javascript
/**
 * Compile a post for this adapter's target.
 *
 * @param {object} post - Loaded post object
 * @param {string} post.body - Resolved body content (includes already processed)
 * @param {object} post.frontmatter - Parsed frontmatter from the per-target file
 * @param {string[]} post.assets - Asset paths referenced by the post
 * @param {object|null} post.media - Parsed media.yaml if present (for video/podcast posts)
 * @param {string} post.dir - Post directory path
 *
 * @param {object} designSystem - Loaded design system
 * @param {object} designSystem.tokens - Parsed tokens.yaml
 * @param {object} designSystem.compiled - Compiled forms { css, json }
 *
 * @returns {{ filename: string, content: string, sidecars?: Record<string, string> }}
 *   - filename: relative output path (e.g., 'my-post.md' or '<slug>/index.md')
 *   - content: file content
 *   - sidecars: optional additional files to write (e.g., Ghost's import JSON)
 */
module.exports.compile = function(post, designSystem) {
  // ...
};

/** Adapter identifier — matches the per-target frontmatter filename (without .md) */
module.exports.name = 'hugo';

/** Output file extension */
module.exports.outputExtension = '.md';

/** Per-target frontmatter filename this adapter consumes */
module.exports.frontmatterFile = 'hugo.md';

/** Optional: declare adapter capabilities for the build runner */
module.exports.capabilities = {
  series: true,           // can generate series index pages
  media: true,            // handles video/podcast embeds
  assets: 'bundled',      // 'bundled' | 'external' | 'inline'
  syntaxHighlight: 'theme-css', // 'theme-css' | 'inline-html' | 'pass-through'
};
```

## Custom adapters

Drop a Node module into `adapters/` matching this contract; the build runner auto-discovers it. The post directory needs a frontmatter file named `<adapter.name>.md` for the adapter to be invoked on that post.

See [`docs/adapter-authoring-guide.md`](../docs/adapter-authoring-guide.md) for a step-by-step walkthrough.

## Capability negotiation

Adapters declare what they can do via `capabilities`. The build runner uses these for fallback behavior — e.g., a series part with a `media.yaml` lands fine in Hugo (full embed) and degrades to a link with duration in plain markdown (no embed support).
