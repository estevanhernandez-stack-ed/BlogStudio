# ADR 0004 — Adapter contract for output targets

**Status:** Accepted

## Context

BlogStudio ships with 5 built-in output adapters (markdown, Hugo, Ghost, Substack, Jekyll). The space of "things people might want to publish to" is much larger — Bear, Mataroa, Hashnode-via-API, Mastodon, custom internal CMSes. Two structural choices:

- **A. Adapters are private to the build script** — adding a new target requires forking the build script.
- **B. Adapters are pluggable Node modules with a stable contract** — anyone can drop a `adapters/<name>.js` matching the contract.

## Decision

Adopted **B**. Every adapter is a Node module exporting:

```javascript
module.exports.compile = function(post, designSystem) {
  return { filename, content, sidecars? };
};
module.exports.name = 'hugo';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'hugo.md';
module.exports.capabilities = { series, media, assets, syntaxHighlight };
```

The build runner auto-discovers adapters in `adapters/` and invokes the matching one for each per-target frontmatter file (`<adapter.name>.md`) present in a post directory. Custom adapters drop in without touching the core build.

`docs/adapter-authoring-guide.md` walks through writing one. The contract is documented in `adapters/README.md`.

## Consequences

**Easier:**

- New CMS targets ship as third-party adapters without upstream PR cycles.
- Built-in adapters and custom adapters share the exact same contract — no second-class citizens.
- The contract is small enough to read and understand in one sitting.

**Harder:**

- Contract changes are breaking changes for any custom adapters in the wild. Treat the contract as semver-stable; bump major if it ever changes.
- The `capabilities` flags add a small amount of indirection in the build runner (e.g., for series support fallback when an adapter declares `series: false`). Worth it for graceful degradation.

Approved. Contract pinned at v1.0; future evolutions get versioned.
