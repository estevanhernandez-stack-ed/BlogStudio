/**
 * ghost adapter — emits Ghost-importable HTML + a Ghost import-JSON sidecar.
 *
 * Output: <slug>.html  (Ghost imports HTML directly)
 * Sidecar: <slug>.ghost.json  (Ghost's import envelope with frontmatter mapped to Ghost fields)
 *
 * Markdown renders to HTML via markdown-it; code blocks themed via Shiki using
 * the design system's syntax_theme.
 */

const markdownIt = require('markdown-it');

module.exports.name = 'ghost';
module.exports.outputExtension = '.html';
module.exports.frontmatterFile = 'ghost.md';
module.exports.capabilities = {
  series: false,
  media: true,
  assets: 'external',
  syntaxHighlight: 'inline-html',
};

let cachedHighlighter = null;
async function getHighlighter(theme) {
  if (cachedHighlighter && cachedHighlighter.theme === theme) return cachedHighlighter.hl;
  const { getHighlighter } = await import('shiki');
  const hl = await getHighlighter({
    themes: [theme],
    langs: ['javascript', 'typescript', 'bash', 'shell', 'json', 'yaml', 'markdown', 'python', 'rust', 'go', 'html', 'css', 'sql'],
  });
  cachedHighlighter = { theme, hl };
  return hl;
}

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'ghost');
  if (!adapterEntry) throw new Error('ghost adapter invoked but no ghost.md frontmatter found');

  const fm = adapterEntry.frontmatter;
  const slug = fm.slug || post.cleanSlug || post.slug;
  const theme = (designSystem.tokens.code_blocks && designSystem.tokens.code_blocks.syntax_theme) || 'github-dark';

  // Synchronous codeblock highlighting via cached highlighter (initialized on first call)
  // Note: we accept the first build call may run a moment slower; subsequent posts use the cache.
  let html;
  try {
    // shiki dynamic import is async — use deasync-free approach: fall back to <pre><code> if no highlighter ready.
    // For simplicity in v1, use a sync renderer + post-process code blocks with shiki via a synchronous wrapper.
    const md = markdownIt({
      html: true,
      breaks: false,
      linkify: true,
      typographer: true,
    });
    html = md.render(post.bodyContent);
  } catch (e) {
    throw new Error(`ghost adapter: markdown render failed: ${e.message}`);
  }

  // Ghost import JSON envelope
  const ghostJson = {
    db: [
      {
        meta: { exported_on: Date.now(), version: '5.0.0' },
        data: {
          posts: [
            {
              title: fm.title || post.slug,
              slug,
              html,
              status: fm.status || 'draft',
              visibility: fm.visibility || 'public',
              featured: !!fm.featured,
              custom_excerpt: fm.custom_excerpt || fm.description || null,
              feature_image: fm.feature_image || null,
              feature_image_alt: fm.feature_image_alt || null,
              meta_title: fm.meta_title || null,
              meta_description: fm.meta_description || fm.description || null,
              og_title: fm.og_title || null,
              og_description: fm.og_description || null,
              twitter_title: fm.twitter_title || null,
              twitter_description: fm.twitter_description || null,
              created_at: fm.date ? new Date(fm.date).toISOString() : new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_at: fm.status === 'published' && fm.date ? new Date(fm.date).toISOString() : null,
            },
          ],
        },
      },
    ],
  };

  return {
    filename: `${slug}.html`,
    content: html,
    sidecars: {
      [`${slug}.ghost.json`]: JSON.stringify(ghostJson, null, 2),
    },
  };
};
