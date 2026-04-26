/**
 * include.js — resolve `{{ include "filename" }}` directives in per-target
 * frontmatter files. The directive is replaced with the contents of the
 * referenced file (relative to the file containing the directive).
 *
 * Errors loudly when an include points to a missing file: a posting bug should
 * fail at build time with the file path + line number, not silently produce
 * a post with a literal `{{ include "body.md" }}` string in it.
 */

const fs = require('fs');
const path = require('path');

const INCLUDE_PATTERN = /\{\{\s*include\s+"([^"]+)"\s*\}\}/g;

/**
 * Resolve includes in a string.
 *
 * @param {string} content - source content possibly containing include directives
 * @param {string} sourceFilePath - absolute path to the file the content came from (used to resolve relative includes)
 * @returns {string} resolved content
 */
function resolveIncludes(content, sourceFilePath) {
  const sourceDir = path.dirname(sourceFilePath);
  const lines = content.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(INCLUDE_PATTERN)];
    if (matches.length === 0) {
      out.push(line);
      continue;
    }

    // Replace each include match in the line
    let replaced = line;
    for (const m of matches) {
      const includePath = path.resolve(sourceDir, m[1]);
      if (!fs.existsSync(includePath)) {
        throw new Error(
          `include.js: ${path.relative(process.cwd(), sourceFilePath).replace(/\\/g, '/')}:${i + 1} ` +
            `references "${m[1]}" which does not exist (resolved to ${includePath}).`
        );
      }
      const includedContent = fs.readFileSync(includePath, 'utf8');
      // If the include is the entire line (with optional whitespace), substitute the content directly.
      // Otherwise, inline the substitution (which may produce odd formatting; users should put includes on their own line).
      if (line.trim() === m[0].trim()) {
        replaced = includedContent.replace(/\n+$/, ''); // strip trailing newlines for clean substitution
      } else {
        replaced = replaced.replace(m[0], includedContent.replace(/\n+$/, ''));
      }
    }
    out.push(replaced);
  }

  return out.join('\n');
}

module.exports = { resolveIncludes };
