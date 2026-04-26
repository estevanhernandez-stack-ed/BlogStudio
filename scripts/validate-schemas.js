#!/usr/bin/env node
/**
 * validate-schemas.js — discovers schema-typed files across the repo and
 * validates each against its JSON Schema. Exits 0 on clean, non-zero on any
 * failure with file + JSON Path + message reported.
 *
 * Discovers:
 *   - 00_DESIGN_SYSTEM/tokens.yaml                  → tokens.schema.json
 *   - 01_POSTS/ ** / <target>.md (frontmatter)      → frontmatter.<target>.schema.json
 *   - 01_POSTS/ ** /media.yaml                      → media.schema.json
 *   - dist/ ** /*.manifest.json                     → manifest.schema.json
 *   - examples/ ** / similar                        → same routing
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCHEMA_DIR = path.join(REPO_ROOT, '00_DESIGN_SYSTEM', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
addFormats(ajv);

// Pre-load all schemas so $ref between them resolves
const ALL_SCHEMAS = {};
for (const file of fs.readdirSync(SCHEMA_DIR)) {
  if (!file.endsWith('.schema.json')) continue;
  const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'));
  ALL_SCHEMAS[file] = schema;
  ajv.addSchema(schema, file);
}

function loadSchema(name) {
  const key = `${name}.schema.json`;
  if (!ALL_SCHEMAS[key]) throw new Error(`Schema not found: ${key}`);
  return ALL_SCHEMAS[key];
}

function walk(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, results);
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

function walkAll(dir, predicate, results = []) {
  // variant that walks into dist/ too (for manifest validation)
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAll(full, predicate, results);
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

function relativize(absPath) {
  return path.relative(REPO_ROOT, absPath).replace(/\\/g, '/');
}

const failures = [];

function record(file, errors) {
  for (const err of errors) {
    failures.push({
      file: relativize(file),
      jsonPath: err.instancePath || '/',
      message: err.message,
      params: err.params,
    });
  }
}

function validateOne(file, schemaName, data) {
  const validate = ajv.getSchema(`${schemaName}.schema.json`) || ajv.compile(loadSchema(schemaName));
  const ok = validate(data);
  if (!ok) record(file, validate.errors);
}

// 1. tokens.yaml
{
  const tokensPath = path.join(REPO_ROOT, '00_DESIGN_SYSTEM', 'tokens.yaml');
  if (fs.existsSync(tokensPath)) {
    try {
      const data = yaml.load(fs.readFileSync(tokensPath, 'utf8'));
      validateOne(tokensPath, 'tokens', data);
    } catch (e) {
      failures.push({ file: relativize(tokensPath), jsonPath: '/', message: `YAML parse error: ${e.message}` });
    }
  }
}

// 2. per-target frontmatter files in 01_POSTS/ and examples/
{
  // adapter name → schema name
  const ADAPTER_SCHEMAS = {
    markdown: 'frontmatter',           // base only
    hugo: 'frontmatter.hugo',
    ghost: 'frontmatter.ghost',
    substack: 'frontmatter.substack',
    jekyll: 'frontmatter.jekyll',
  };

  const candidates = [
    ...walk(path.join(REPO_ROOT, '01_POSTS'), (f) => f.endsWith('.md') && !f.endsWith('body.md') && !f.endsWith('_index.md')),
    ...walk(path.join(REPO_ROOT, 'examples'), (f) => f.endsWith('.md') && !f.endsWith('body.md') && !f.endsWith('_index.md') && !f.endsWith('README.md')),
  ];

  for (const file of candidates) {
    const base = path.basename(file, '.md');
    const schemaName = ADAPTER_SCHEMAS[base];
    if (!schemaName) continue; // not a per-target frontmatter file

    try {
      const parsed = matter(fs.readFileSync(file, 'utf8'));
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        validateOne(file, schemaName, parsed.data);
      } else {
        failures.push({ file: relativize(file), jsonPath: '/', message: 'Per-target frontmatter file has no frontmatter block' });
      }
    } catch (e) {
      failures.push({ file: relativize(file), jsonPath: '/', message: `Frontmatter parse error: ${e.message}` });
    }
  }
}

// 3. media.yaml files
{
  const mediaFiles = walk(path.join(REPO_ROOT, '01_POSTS'), (f) => path.basename(f) === 'media.yaml')
    .concat(walk(path.join(REPO_ROOT, 'examples'), (f) => path.basename(f) === 'media.yaml'));
  for (const file of mediaFiles) {
    try {
      const data = yaml.load(fs.readFileSync(file, 'utf8'));
      validateOne(file, 'media', data);
    } catch (e) {
      failures.push({ file: relativize(file), jsonPath: '/', message: `YAML parse error: ${e.message}` });
    }
  }
}

// 4. build manifests
{
  const manifests = walkAll(path.join(REPO_ROOT, 'dist'), (f) => /\.manifest\.json$/.test(f))
    .concat(walk(path.join(REPO_ROOT, 'examples'), (f) => /\.manifest\.json$/.test(f)));
  for (const file of manifests) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      validateOne(file, 'manifest', data);
    } catch (e) {
      failures.push({ file: relativize(file), jsonPath: '/', message: `JSON parse error: ${e.message}` });
    }
  }
}

if (failures.length === 0) {
  console.log('Schema validation: clean.');
  process.exit(0);
}

console.error(`Schema validation: ${failures.length} failure(s).\n`);
for (const f of failures) {
  console.error(`  ${f.file}${f.jsonPath !== '/' ? ` ${f.jsonPath}` : ''}`);
  console.error(`    ${f.message}`);
  if (f.params && Object.keys(f.params).length > 0) {
    console.error(`    (${JSON.stringify(f.params)})`);
  }
}
process.exit(1);
