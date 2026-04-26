# Troubleshooting

Common errors and how to resolve them.

---

## Build fails with "no posts found in 01_POSTS/"

**Cause:** No post directories exist in `01_POSTS/` (only the README is there).

**Fix:** Either run `/new-post` (Claude skill) or copy `examples/single-post/01_POSTS/2026-04-26-hello-vibe-coding/` into `01_POSTS/`. The build needs at least one post directory containing `body.md` + at least one per-target frontmatter file.

---

## Build fails with "no adapters loaded from adapters/"

**Cause:** `adapters/` directory is empty or all adapter files threw on import.

**Fix:** confirm the 5 built-in adapters (`markdown.js`, `hugo.js`, `ghost.js`, `substack.js`, `jekyll.js`) exist in `adapters/`. If you forked and removed them, you need at least one. Check the import errors logged at build time.

---

## Schema validation fails with "must be string" on a date field

```text
01_POSTS/.../hugo.md /date
  must be string
```

**Cause:** YAML auto-parses unquoted ISO-format dates as JavaScript Date objects, but the schema expects a string.

**Fix:** quote the date in your frontmatter:

```yaml
date: "2026-04-26"     # correct
# date: 2026-04-26     # wrong — parses as Date object
```

This is the convention across all per-target frontmatter files. Quoted dates also avoid timezone surprises.

---

## Build succeeds but adapter X produces no output

**Cause:** The post directory doesn't contain a per-target frontmatter file for adapter X.

**Fix:** create `<adapter>.md` in the post directory (e.g., `hugo.md` to enable Hugo output). Use `examples/single-post/01_POSTS/2026-04-26-hello-vibe-coding/` as a reference for the frontmatter shape per adapter.

---

## Build succeeds but my code blocks aren't syntax-highlighted in Ghost output

**Cause:** Ghost adapter renders markdown via markdown-it, which produces fenced `<pre><code class="language-X">` blocks. The class is set, but Ghost's themes need to actually render the highlighting from those classes (Ghost ships Prism by default).

**Fix:** confirm your Ghost theme has Prism (or another syntax highlighter) enabled. Or use the substack adapter pattern (inline styles) if you need the highlighting baked into the HTML.

A future enhancement: pre-render code blocks via Shiki at build time so the HTML ships with inline-styled syntax. Track in [issue tracker].

---

## `{{ include "body.md" }}` shows up literally in the output

**Cause:** Your per-target frontmatter file has a typo in the include directive — wrong filename, missing quotes, extra spaces.

**Fix:** correct directive syntax is `{{ include "body.md" }}` (with double quotes, single space inside braces). Check the include filename matches an actual file in the post directory.

If you intend the literal text to appear (rare), escape it: `\{{ include "body.md" }}`.

---

## "Husky hooks aren't running on commit"

**Cause:** Husky needs to be installed on the local clone, which `npm run prepare` does — but only if `npm install` ran in a git-initialized directory.

**Fix:**

```bash
rm -rf .husky/_
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

On Windows, hooks should still run via Git Bash or WSL; native Windows shell may not respect the shebang.

---

## Series indexer skips a part

**Cause:** A part's frontmatter is missing `series:` or `series_order:`, OR `series:` doesn't match the parent series directory name.

**Fix:** check each part's frontmatter (any per-target file works for the check):

```yaml
series: my-series-slug      # must match parent dir name
series_order: 2             # must be an integer
```

If two parts claim `series_order: 2`, the build will write both but the order is undefined. Renumber.

---

## Adapter X errors with "compile() returned invalid result"

**Cause:** A custom adapter you wrote returned something that's not `{ filename, content }`. Both fields are required.

**Fix:** check the adapter's `compile` function returns an object with both fields populated. See `adapters/markdown.js` for the minimum shape.

---

## Multi-author build fails with "body.md not found"

**Cause:** A post directory has per-target frontmatter files (`hugo.md` etc.) but no `body.md`. For multi-author posts, `body.md` is produced by the merge skill from `04_MULTI_AUTHOR/<post-slug>/author-*.md` files.

**Fix:** run the `merge-authors` Claude skill on the multi-author directory, or manually create `body.md` in the post directory. Build reads `body.md` regardless of how it got there.

---

## Hugo preview doesn't pick up changes

**Cause:** Hugo's content auto-reload watches `content/posts/` etc., not your build output dir. After `npm run build`, you need to copy or symlink `dist/hugo/<slug>/` into your Hugo site's `content/posts/`.

**Fix:** if you're previewing locally with Hugo, set up a script that runs `npm run build` then copies `dist/hugo/*` into your Hugo site's content dir. Or use a watch task.

---

## Substack output looks plain when imported

**Cause:** Substack strips most CSS classes and external stylesheets. Even inline styles get partially filtered.

**Fix:** this is a Substack-side limitation, not a BlogStudio bug. The substack adapter applies inline styles for code blocks (which Substack mostly preserves), but headings, paragraphs, and lists use Substack's own styling. For maximum visual control on Substack, paste the HTML into Substack's editor and then manually adjust formatting in their editor.

---

## Still stuck?

- Search closed issues: <https://github.com/estevanhernandez-stack-ed/BlogStudio/issues?q=is%3Aissue+is%3Aclosed>
- Open a new issue using the bug report template
- Check `docs/architecture.md` for how the affected component is supposed to work

When filing an issue, include:

- BlogStudio commit/version
- OS + Node version
- Hugo version (if a Hugo build error)
- Affected adapter(s)
- The exact command that failed and full output
- Whether you're using the devcontainer or local install
