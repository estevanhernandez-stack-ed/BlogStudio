# What Skills Actually Are

A skill is a markdown document with frontmatter. That's it. The format is so quiet that it's easy to miss what makes the pattern powerful: a skill is a *named, scoped, reusable* set of instructions Claude can invoke on demand. It's the difference between asking Claude to "review this code" every time and having a `/review` skill that knows what review means in your codebase.

## The structure

Every skill file (`SKILL.md`) starts with frontmatter declaring its name and description, then prose telling Claude how to do the thing. The description is the part Claude reads to decide when to invoke the skill. The prose is what gets loaded into context when the skill fires.

That two-layer structure is the whole architectural insight: discovery via description, execution via prose. Skills don't fight for context budget; they sit dormant until summoned.

## Why this beats prompt templates

Prompt templates live in your head, your notes, or a snippets manager. Skills live in the repo, version-controlled, alongside the code they operate on. When the codebase shifts, the skill shifts with it — same PR, same review.
