---
name: task-cost
description: Calculate what a QA task cost in model tokens, per agent and per model (Opus, Sonnet, Haiku priced separately), from the Claude Code session transcripts. Use when closing a task journal, when estimating a plan's cost from earlier tasks, or when someone asks what a feature or agent run cost.
---

# Task cost

Every agent runs on its own model (`model:` in `.claude/agents/<name>.md`), so a task's cost depends on how the work was split. The script reads the real token usage of every API request in the session, so it doesn't rely on estimates.

## Run it

From the repo root:

```bash
node .claude/skills/task-cost/scripts/task-cost.mjs --since=<journal Started timestamp>           # current session, markdown tables
node .claude/skills/task-cost/scripts/task-cost.mjs --session=<id> --since=<ISO> --until=<ISO>    # a specific session or window
node .claude/skills/task-cost/scripts/task-cost.mjs --since=<ISO> --json                          # for further processing
```

- **Session**: defaults to the most recently written session of this project (`~/.claude/projects/<repo path with non-alphanumerics as ->/`), which is the one you're running in. It covers the main session (the coordinator) and all its subagents.
- **Window**: `--since` is the journal's **Started** timestamp, so earlier, unrelated work in the same session isn't counted. Add `--until` when later work in the session belongs to another task.
- **Output**: a `Cost:` line, a per-agent table (requests, input, cache write, cache read, output, cost, share) and a per-model table. Each API response is counted once.

## How it's priced

- Prices come from `.claude/skills/task-cost/pricing.json` (USD per 1M tokens: input, output, 5-minute and 1-hour cache writes, cache reads; Haiku 5.5 has a higher rate above 100K prompt tokens). **Update that file when prices change**, and keep `asOf` current. A model missing from it is listed as "Not priced".
- The figure is the **API list-price equivalent**. On a Claude subscription the actual bill is different; the number is still the right one for comparing tasks and agent model choices.
- Most input is cache reads, so the coordinator's long session context is usually a large share. That's expected.

## Record it

In the task journal's **Cost** section, paste the `Cost:` line and both tables, and add one line of interpretation: the most expensive agent and why (e.g. many review rounds on Opus, a long MCP exploration). Use earlier journals' Cost sections for the plan's cost note on similar tasks.
