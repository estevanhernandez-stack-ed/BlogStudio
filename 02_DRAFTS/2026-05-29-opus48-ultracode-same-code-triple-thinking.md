---
title: "Same code, triple the thinking: what Opus 4.8 and ultracode actually changed"
date: 2026-05-29
status: draft
studio: BlogStudio
tags: [claude-code, ai-agents, vibe-coding, building-in-public, opus-4.8]
summary: "I turned on max-orchestration expecting more output. Eight sessions later the agent had burned three times the tokens and written the same amount of code. The extra went somewhere more interesting than lines."
---

I turned on Claude Code's ultracode mode the day Opus 4.8 shipped, expecting more output. Eight sessions later the agent had burned **3.2 times the tokens** and written **the same number of lines of code**. The interesting part is where the other two-thirds of the tokens went.

Ultracode is max-orchestration: instead of one thread doing the work, the agent fans it out to subagents by default. To see what that changed, I compared the eight sessions I ran on it against the eight right before, on the same day-and-a-half window, matched count, idle time stripped out so the clock reflects real working time and not a session left open overnight. Both columns are fully measured across two machines.

| Measure | Before | Ultracode | Change |
| --- | --- | --- | --- |
| Burn per session | 625K | 2.02M | 3.2x |
| Active time per session | 91 min | 171 min | 1.9x |
| Subagents per session | 7.9 | 10.5 | 1.3x |
| Lines written per session | 2,213 | 2,062 | 0.9x |
| Burn per active hour | 413K | 708K | 1.7x |
| Lines per active hour | 1,461 | 724 | 0.5x |
| Lines per 1M tokens | 3,540 | 1,022 | 0.3x |

## Where the tokens actually went

Read the bottom three rows together. Token effort per hour went up. Code produced per hour fell by half. Code per token dropped to a third. The agent spent more and typed less.

The clearest case was a single session that burned five million tokens across seventy-five subagents and produced under five thousand lines. A planning run, almost all of it reasoning, verification, and coordination. A pre-ultracode session burned three million and wrote eleven thousand. Burn was never a measure of output. It measures deliberation, and ultracode deliberates hard.

## How many agents, really

My normal sessions already lean on multi-agent work: seven or eight subagents fanned out for a big task is routine. Across the ultracode sessions the average ran nine to eleven. A bump, not a leap, and the bump is the part worth reading carefully.

The visible count is the same Agent-tool fan-out I have always used, just more of it. The genuinely new mechanism is Workflow mode, and the data is clean: across two hundred-plus sessions the Workflow tool fired seventeen times in five sessions, and every one of those five is an ultracode session. None before. What makes it deceptive is that each Workflow call runs its own fleet of subagents a level below the surface, and those never show up in the headline count. So in the Workflow sessions the real fan-out is larger than the number says, not smaller. The orchestration moved down a floor where the dashboard cannot see it.

## The new thing: the marathon

One ultracode session ran 8.6 hours of active time as a single sustained autonomous orchestration, seventy-five subagents deep. Nothing in the prior window looked like that. The mode did not make my sessions faster. It made a new kind of session possible: the long, patient, self-checking run I would never have sat through by hand.

## What it feels like to drive

The number does not capture the part that changed how the work felt. The longer runs were harder to redirect without stopping them. Queued messages sat unread while the agent worked through its plan, so steering mid-run meant interrupting, not nudging. It locks in.

That is a feature for a well-specified task and a friction for a loose one. It was excellent when I knew exactly what I wanted, and poor the moment I wanted to brainstorm or turn the wheel halfway. I read that as a planning problem on my end, not a flaw in the mode: spec the work tight and hand it off, keep the brainstorming and the redirects in an ordinary session. Ultracode rewards a clean plan and punishes mid-flight steering. Stage the work to match.

## What this can't tell me yet

Whether all that deliberation produced better code. Lines cannot answer it. Fewer bugs, sounder structure, less rework downstream, those are the metrics that would justify three times the spend, and I do not have them yet. The hint is there, the extra verification caught real breakage that lighter runs missed, but a hint is not a measurement.

Two honest caveats. Eight sessions a side over a day and a half is a shape, not a trend. And "lines written" is gross authored churn, not net diff: one session shows eleven thousand lines authored against twelve hundred actually committed. Treat the columns as relative, not absolute.

The agent did not get faster. It got more careful. Whether careful is worth triple is the only question left, and it is the one I am measuring next.

— Este
