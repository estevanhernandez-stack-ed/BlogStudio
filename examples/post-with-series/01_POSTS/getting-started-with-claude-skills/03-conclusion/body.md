# Shipping It

Skills are the kind of code that gets shared. Once you have one that works, the question is how to make it useful to others without bloating their context.

## Distribution paths

Three live patterns:

1. **Repo-local** — `.claude/skills/<name>/SKILL.md` in the project. Useful for project-specific workflows. Doesn't help anyone outside the project.
2. **Plugin** — bundle the skill into a [Claude Code plugin](https://docs.claude.com/claude-code/plugins). Users install the plugin, get the skill. Best for skills that don't depend on a specific codebase.
3. **Marketplace** — publish to [claude.ai/marketplace](https://claude.ai/marketplace). Wider reach, formal review.

## Versioning

Skills evolve. When you change a skill's behavior in a way users depend on, bump a version in the description (`v2 — now handles JSON traces`). Don't break the description without warning — Claude's invocation logic depends on it.

## Where this leaves you

You've now got the pattern. The hard part isn't writing skills — it's recognizing when to write one. Look for the next thing you've explained to Claude three times. That's a skill waiting to happen.

For more depth, see [Vibe Cartographer](https://github.com/estevanhernandez-stack-ed/Vibe-Cartographer) — a plugin built around 8 skills that map a complete project workflow.
