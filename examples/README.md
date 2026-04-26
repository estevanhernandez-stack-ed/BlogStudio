# examples/

Self-contained test fixtures demonstrating every BlogStudio feature. CI uses these as smoke tests on every PR.

## Fixtures (populated as the build progresses)

| Fixture | Demonstrates |
| --- | --- |
| `single-post/` | Minimal post with all 5 adapter frontmatter files. CI smoke-test target. |
| `post-with-series/` | 3-part series with `_index.md`, demonstrates subdirectory + frontmatter cross-references |
| `multi-author-post/` | Two `author-*.md` files + merged `body.md` produced by the merge-authors skill |
| `video-podcast-post/` | Post with `media.yaml` + `transcript.md`; shows embed + transcript handling per adapter |

## Using a fixture

Each fixture is a complete mini-blog. To build one:

```bash
cd examples/single-post
npm run build  # uses parent repo's scripts and toolchain
```

(The build script auto-detects when invoked from inside an example fixture.)

## Adding a new fixture

A fixture exercises ONE or a few related features end-to-end. Drop a self-contained subdirectory here, with its own minimal `CLAUDE.md` (pillar overrides as needed) and source files.
