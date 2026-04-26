/**
 * markdown adapter — emits a clean markdown file ready to copy-paste into
 * dev.to, Medium, Hashnode, or any markdown-accepting platform.
 *
 * Output: <slug>.md with the per-target frontmatter + resolved body.
 * Code blocks remain as fenced code (target tools handle their own highlighting).
 */

const matter = require('gray-matter');

module.exports.name = 'markdown';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'markdown.md';
module.exports.capabilities = {
  series: false,
  media: false,
  assets: 'external',
  syntaxHighlight: 'pass-through',
};

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'markdown');
  if (!adapterEntry) throw new Error('markdown adapter invoked but no markdown.md frontmatter found');

  const slug = adapterEntry.frontmatter.slug || post.cleanSlug || post.slug;
  // Use gray-matter's stringify to produce frontmatter + body
  const content = matter.stringify(post.bodyContent, adapterEntry.frontmatter);

  return {
    filename: `${slug}.md`,
    content,
  };
};
