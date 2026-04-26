# Authoring Your First Skill

The smallest useful skill takes about 10 minutes to write. It has one job, does that job well, and gets out of the way. Let's build one: a skill that takes a stack trace and produces a focused debugging plan.

## The frontmatter

```yaml
---
name: debug-stacktrace
description: Use when the user pastes a stack trace or error log — extracts the root frame, identifies likely causes, proposes the next two diagnostic steps.
---
```

The `description` is doing real work: it's how Claude decides whether this skill applies to the current request. Be specific. "Helps with debugging" is too vague; "Use when the user pastes a stack trace or error log" gives Claude a clear trigger.

## The prose

Below the frontmatter, write the instructions as if explaining to a thoughtful junior engineer. State what to do, what NOT to do, what edge cases to handle. Don't write code; write *guidance*.

```markdown
# Debug Stacktrace Skill

You're helping the user diagnose a stack trace. Workflow:

1. Identify the root frame (deepest user-code frame, not framework).
2. Surface the likely cause based on the exception type + the operation
   that failed.
3. Propose exactly two diagnostic steps — the cheapest one first, then
   the next-cheapest. Don't propose the full debugging tree.

Don't:
- Suggest fixes before the cause is identified.
- Recommend changing more than one thing at a time.
- Add print statements without a specific question to answer.
```

## Test it

Drop the file into `.claude/skills/debug-stacktrace/SKILL.md`, then paste a stack trace into Claude Code. The skill should fire automatically based on the description.
