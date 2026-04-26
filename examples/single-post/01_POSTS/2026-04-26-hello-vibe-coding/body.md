# Hello, Vibe Coding

Vibe coding deserves serious treatment as a discipline. The shorthand makes it sound casual — "just chat with the AI until it works" — but the practice is anything but casual. It requires sharper architectural thinking than typing-the-code-yourself ever did, because you're not debugging your own keystrokes anymore. You're debugging your own intent.

## Three patterns that work

### 1. Architect first, prompt second

The temptation is to start with "build me a thing." That's a prompt that produces a thing, but rarely the *right* thing. Better: spend the first 20 minutes drawing the architecture in markdown — components, data flow, boundaries — and only then prompt against it. The architecture doc becomes the agent's spec.

```bash
# Don't:
claude "build a todo app"

# Do:
claude "read docs/architecture.md and implement step 1"
```

### 2. Verify before continuing

Agents lie. Or rather: they confidently assert success when the underlying state hasn't actually changed. After every meaningful step, verify in the real system: run the test, open the page, query the API. Trust nothing the agent claims about "working" without independent confirmation.

### 3. One agent at a time per concern

Parallel agents are powerful, but each agent needs a single concern. Spawning one agent to "do the whole feature" produces shallow work; spawning five agents along the right axes (data layer, UI, tests, docs, integration) produces depth. The discipline is in scoping the axes.

## When vibe coding fails

The pattern breaks when the architecture is unclear *to the human*. Agents amplify what you give them — give them a fuzzy spec, get fuzzy code; give them a sharp spec, get sharp code. If the agent's output feels generic, the diagnosis is rarely "the agent is dumb." It's almost always "my spec was vague."

## What to read next

- The [Vibe Cartographer](https://github.com/estevanhernandez-stack-ed/Vibe-Cartographer) plugin formalizes a lot of these patterns into an 8-step workflow.
- For the discipline side: write your architecture docs *before* you open Claude Code.
