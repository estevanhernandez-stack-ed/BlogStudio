/**
 * jekyll adapter — emits a Jekyll post.
 *
 * Output: _posts/YYYY-MM-DD-<slug>.md  (Jekyll post convention)
 * Frontmatter: passed through, with Jekyll-specific defaults applied if missing.
 * Assets: copied to dist/jekyll/assets/<slug>/ (handled by orchestrator's asset routing).
 * Series: supported via Jekyll collection conventions.
 */

const matter = require('gray-matter');

module.exports.name = 'jekyll';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'jekyll.md';
module.exports.capabilities = {
  series: true,
  media: false,
  assets: 'external',
  syntaxHighlight: 'pass-through',
};

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'jekyll');
  if (!adapterEntry) throw new Error('jekyll adapter invoked but no jekyll.md frontmatter found');

  const fm = { ...adapterEntry.frontmatter };
  if (fm.layout == null) fm.layout = 'post';
  if (fm.published == null) fm.published = true;

  // Jekyll filename pattern: YYYY-MM-DD-<slug>.md
  const date = fm.date || new Date().toISOString().slice(0, 10);
  const dateStr = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);
  const slug = fm.slug || post.cleanSlug || post.slug;

  const content = matter.stringify(post.bodyContent, fm);

  return {
    filename: `_posts/${dateStr}-${slug}.md`,
    content,
  };
};
