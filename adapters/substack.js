/**
 * substack adapter — emits Substack-friendly HTML for paste-into-Substack flow.
 *
 * Output: <slug>.html with inline styles (Substack strips external CSS).
 *
 * Markdown renders to HTML via markdown-it. Code blocks get inline-style
 * <pre><code> using design-system tokens (Substack permits limited inline CSS).
 *
 * Substack's API doesn't currently support direct posting; the workflow is:
 * paste the HTML into Substack's editor, then publish/email-send from there.
 */

const markdownIt = require('markdown-it');

module.exports.name = 'substack';
module.exports.outputExtension = '.html';
module.exports.frontmatterFile = 'substack.md';
module.exports.capabilities = {
  series: false,
  media: false,
  assets: 'external',
  syntaxHighlight: 'inline-html',
};

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'substack');
  if (!adapterEntry) throw new Error('substack adapter invoked but no substack.md frontmatter found');

  const fm = adapterEntry.frontmatter;
  const slug = fm.slug || post.cleanSlug || post.slug;
  const tokens = designSystem.tokens;

  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  });

  // Inline-style overrides for code blocks (Substack strips classes)
  const codeBg = (tokens.colors && tokens.colors.code_background) || '#1e293b';
  const codeFg = (tokens.colors && tokens.colors.code_foreground) || '#e2e8f0';
  const codeFont = (tokens.typography && tokens.typography.code_font) || 'Menlo, Consolas, monospace';

  md.renderer.rules.code_block = (tokens, idx) => {
    const escaped = md.utils.escapeHtml(tokens[idx].content);
    return `<pre style="background:${codeBg};color:${codeFg};font-family:${codeFont};padding:1em;border-radius:6px;overflow-x:auto;"><code>${escaped}</code></pre>\n`;
  };
  md.renderer.rules.fence = (tokens, idx) => {
    const escaped = md.utils.escapeHtml(tokens[idx].content);
    return `<pre style="background:${codeBg};color:${codeFg};font-family:${codeFont};padding:1em;border-radius:6px;overflow-x:auto;"><code>${escaped}</code></pre>\n`;
  };

  let html;
  try {
    html = md.render(post.bodyContent);
  } catch (e) {
    throw new Error(`substack adapter: markdown render failed: ${e.message}`);
  }

  // Wrap in a minimal note about substack metadata since substack doesn't honor frontmatter on import
  const meta = [];
  if (fm.subtitle) meta.push(`<p><em>${fm.subtitle}</em></p>`);
  const finalHtml = meta.join('\n') + '\n' + html;

  return {
    filename: `${slug}.html`,
    content: finalHtml,
  };
};
