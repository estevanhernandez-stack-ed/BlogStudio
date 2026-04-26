# Security Policy

BlogStudio is a template repository. Most "security" concerns relate to the **scaffolding scripts** (Node.js code in `scripts/`, adapters in `adapters/`, hooks in `.husky/`, CI workflows in `.github/workflows/`) — not to user content.

## What's in scope

| Concern | In scope? |
| --- | --- |
| Command injection in build, validation, or adapter scripts | Yes — report it |
| Schema validation that misses obviously bad input | Yes — report it |
| Adapter that emits unsanitized HTML in a context where it could XSS | Yes — report it |
| CI workflow that exposes secrets or runs untrusted code | Yes — report it |
| Devcontainer image with known CVEs in bundled tools | Yes — report it |
| CMS-side vulnerabilities (Hugo, Ghost, etc.) | Out of scope — report to those projects |
| Your forked blog content | Out of scope — that's your responsibility in your fork |
| Custom adapters you've written | Out of scope unless they ship in the upstream repo |

## Reporting a vulnerability

Email **security@626labs.dev** with:

- A description of the issue and where it lives in the codebase
- Steps to reproduce (proof-of-concept welcome)
- Your assessment of severity

We aim to acknowledge reports within 72 hours. Critical issues addressed in a patch release; lower-severity issues bundled into the next regular release.

## Scope of "BlogStudio" for this policy

Only the contents of the upstream `BlogStudio` template repo. Forks are the forker's responsibility. If you find a bug in someone's published blog fork, contact them directly.

## Safe-by-default principles

The template adheres to:

- All shell-out calls in scripts use `execFile` / `spawn` with explicit argument arrays — never `exec` with string concatenation.
- Schemas in `00_DESIGN_SYSTEM/schemas/` set `additionalProperties: false` to fail loudly on unexpected input.
- Built-in adapters HTML-escape body content where the target consumes HTML.
- CI workflows pin tool versions where security-relevant.
- No telemetry. No phone-home. No third-party network calls except those the user explicitly invokes (npm install, Hugo build, Claude Code).
