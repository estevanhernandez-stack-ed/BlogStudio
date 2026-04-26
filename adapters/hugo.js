/**
 * hugo adapter — emits a Hugo page bundle.
 *
 * Output: <slug>/index.md  (Hugo page bundle convention)
 * Frontmatter: passed through, with Hugo-specific defaults applied if missing.
 * Assets: copied into the page bundle dir by the build orchestrator.
 * Series: supported (build orchestrator generates series indices).
 * Media: supported via Hugo shortcode invocation.
 */

const matter = require('gray-matter');

module.exports.name = 'hugo';
module.exports.outputExtension = '.md';
module.exports.frontmatterFile = 'hugo.md';
module.exports.capabilities = {
  series: true,
  media: true,
  assets: 'bundled',
  syntaxHighlight: 'pass-through',
};

module.exports.compile = function (post, designSystem) {
  const adapterEntry = post.adapters.find((a) => a.name === 'hugo');
  if (!adapterEntry) throw new Error('hugo adapter invoked but no hugo.md frontmatter found');

  const fm = { ...adapterEntry.frontmatter };
  // Apply Hugo defaults if missing
  if (fm.draft == null) fm.draft = false;

  let body = post.bodyContent;

  // Inject media shortcode if media.yaml is present and adapter supports media
  if (post.media) {
    const mediaShortcode = renderHugoMediaShortcode(post.media);
    body = mediaShortcode + '\n\n' + body;
  }

  // Append transcript if present and adapter supports it
  if (post.transcriptPath && post.media) {
    const fs = require('fs');
    const transcript = fs.readFileSync(post.transcriptPath, 'utf8');
    body += '\n\n---\n\n## Transcript\n\n' + transcript;
  }

  const content = matter.stringify(body, fm);
  const slug = fm.slug || post.cleanSlug || post.slug;

  return {
    filename: `${slug}/index.md`,
    content,
  };
};

function renderHugoMediaShortcode(media) {
  if (media.type === 'audio') {
    return `{{< audio src="${media.url}" duration="${media.duration_seconds}" >}}`;
  }
  if (media.type === 'video') {
    const thumb = media.thumbnail_url ? ` thumbnail="${media.thumbnail_url}"` : '';
    return `{{< video src="${media.url}" duration="${media.duration_seconds}"${thumb} >}}`;
  }
  return '';
}
