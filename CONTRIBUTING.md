# Contributing to BlogStudio

Thanks for the interest. BlogStudio is a **template** — its primary use is to be forked, customized, and made into your own blog. Contributions back to the template repo are welcome but should focus on improvements that help all forking users, not on changes specific to your blog.

## Forking vs. Contributing

| You want to | Do this |
| --- | --- |
| Use BlogStudio for your own blog | Fork it, customize via `/bootstrap` or manual edits, then iterate on your fork |
| Improve the template for everyone | Open an issue here, then PR against this repo |
| Ship a new output adapter | See `docs/adapter-authoring-guide.md`. Custom adapters live in your fork; only adapters with broad utility (a major new CMS) belong upstream |
| Report a bug | Open a bug report (use the issue template) |
| Suggest a feature | Open a feature request (use the issue template) |

## Development setup

```bash
git clone https://github.com/estevanhernandez-stack-ed/BlogStudio.git
cd BlogStudio
npm install
```

For Hugo preview, install Hugo Extended locally OR open in VS Code Dev Containers (`.devcontainer/` bundles Node + Hugo).

## Code style

- **Scripts** (`scripts/`) and **adapters** (`adapters/`): Node.js, ES2022, no TypeScript. Use `execFile` / `spawn` with array args — never `exec` with string concatenation.
- **Markdown**: Validated by `markdownlint-cli2`; run `npm run lint:md`.
- **Schemas** (`00_DESIGN_SYSTEM/schemas/`): JSON Schema draft-07. Run `npm run validate` to verify.

## Adapter contributions

If you're adding a new built-in adapter (e.g., for a major CMS we don't yet support):

- [ ] Adapter file `adapters/<name>.js` exports `compile`, `name`, `outputExtension`, `frontmatterFile`, `capabilities`
- [ ] Per-target frontmatter schema added at `00_DESIGN_SYSTEM/schemas/frontmatter.<name>.schema.json`
- [ ] At least one test fixture in `examples/` exercises the adapter
- [ ] CI workflow updated to build the new adapter for the smoke-test fixture
- [ ] ADR in `docs/adr/` documents the decision and target's quirks

## Pull request checklist

Before opening a PR:

- [ ] `npm run lint:md` passes
- [ ] `npm run validate` passes
- [ ] `npm run build` succeeds on `examples/single-post/`
- [ ] If you added a new schema field, the corresponding ADR is updated
- [ ] If you changed user-facing behavior, `docs/getting-started.md` or `README.md` reflects the change
- [ ] No secrets or personal blog content included

## Architectural changes

Major changes need an ADR in `docs/adr/`. Open an issue first to discuss.

## Reporting security issues

See [SECURITY.md](SECURITY.md). Don't open public issues for security problems.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
