---
name: journal
description: Protocol for the QA Journal. JOURNAL.md holds the Standing Rules and an index; each task that needs planning or agent hand-over gets its own journal file in journal/ carrying its context, acceptance criteria, plan, decisions and what was and was not done. Every QA agent follows it.
---

# The Journal

The Journal is the agents' shared memory and the human audit trail. It answers, for anyone who comes later (human, agent or agent-doctor): **what was asked, what was agreed, what was decided and why, what was done, and what was deliberately not done.** It's committed with the work it describes.

## Files

| File | Holds | Written by |
|---|---|---|
| `JOURNAL.md` (repo root) | **Standing Rules** every agent obeys on every task, plus the **Index** of task journals | coordinator (index); agent-doctor or humans (rules) |
| `journal/<YYYY-MM-DD>-<slug>.md` | One **task journal** per task that needs one (see below) | created by the coordinator from `journal/_TEMPLATE.md`; filled in by every agent on the task |

## When a task journal is created

The **qa-coordinator** creates a task journal once the stakeholder has answered the clarifying questions and approved the plan, and before dispatching anything, when the task meets **any** of these:
- more than one agent will work on it (any hand-over),
- the plan has three or more steps,
- requirements or acceptance criteria had to be clarified or extracted (Jira, Confluence, user Q&A),
- it includes an external write (Jira or Confluence) or a framework or architecture decision.

Small tasks need no journal file: one agent, one step, nothing to hand over (run the CI suite, rerun a test, fix one locator, answer a question). The coordinator reports those in its reply. If a small task grows (a failure needs fixing by another agent), the coordinator creates the journal at that point and records the earlier steps in it.

Only the coordinator creates task journals and edits the Index. Specialists never create one; if you think a task needs one and none was given, say so in your reply.

## How each section is used

The journal is the **source of truth** for the task. When it and your prompt disagree, the journal wins; report the conflict.

| Section | Purpose | Who writes |
|---|---|---|
| Request | the user's words, verbatim | coordinator |
| Context | relevant existing pages, tests, test cases, Jira and Confluence links, earlier journals: everything an agent needs so it doesn't re-research | coordinator (agents add what they discover) |
| Clarifications | questions asked and the answers | coordinator |
| Scope / Out of Scope | boundaries agents must not cross | coordinator |
| Acceptance Criteria | numbered and verbatim from the source; the **definition of done** for the task. Test cases trace to these. | coordinator or test-analyst |
| Rules for this task | task-specific constraints (e.g. "don't touch CartPage") | coordinator |
| Plan | numbered tasks: agent, inputs, expected output, status (`todo` / `in progress` / `done` / `blocked`), approved external writes | coordinator (agents update only the status of their own task) |
| Decisions | decisions taken during the task: what, by whom, why, alternatives rejected | any agent, for choices within its remit |
| Decisions needed | open questions only the user or the architect can answer; work that depends on them is `blocked` | any agent |
| Defects | suspected and confirmed defects with steps to reproduce, status and test handling (bug-reporting skill) | any agent; status set by the coordinator from the stakeholder's answer |
| Agent Log | one block per agent per task, appended | each agent |
| Not Done | everything skipped, deferred or impossible, with the reason | any agent |
| Results | run summaries and the final outcome against each Acceptance Criterion | test-executor, coordinator |
| Issues & improvement comments from user | every issue, correction or improvement idea the stakeholder raises in any phase, verbatim, with what it is about; the agent-doctor's main input | coordinator (in the stakeholder's words) |
| Doctor | after every delivery: instruction weaknesses found in this journal and proposed improvements, with their status (proposed / applied / rejected) | agent-doctor |

## Working rules for every agent

1. **Before acting**, read `JOURNAL.md` Standing Rules, then the task journal named in your prompt: Context, Scope, Out of Scope, Acceptance Criteria, Rules, your Plan task, and existing Decisions. Don't redo research that Context already holds.
2. **Decide within the journal.** A choice inside your remit goes under **Decisions** with its reason. A choice outside it (product behaviour, scope, framework changes) goes under **Decisions needed**: mark your task `blocked` and return. Never resolve it by assumption.
3. **Trace to Acceptance Criteria.** Test cases, tests and results reference AC numbers. Work that maps to no AC is out of scope unless the journal says otherwise.
4. **Write as you go.** Set your Plan task to `in progress` when you start, append your Agent Log block before returning, then set it to `done` or `blocked`. If you're interrupted, the journal should still show how far you got.
5. **Not Done is mandatory.** If nothing was skipped, write `- none` in your block. One line per item; update an existing line rather than adding a near-duplicate.
6. **Facts, not narration.** Files, test names, numbers, commands, `Result:` lines. No secrets or personal data, since the journal is committed.

## Agent Log block

```md
### <agent-name>: Plan #<n>: <one-line outcome>
- Did: <files, tests, test case ids, Jira keys>
- Decided: <choice> because <reason> (also copied to Decisions)
- Skipped: <what and why> (also copied to Not Done)
- Evidence: <Result: line, locator count check, screenshot path, ...>
```

Keep a task journal under about 200 lines; link to `qa/test-cases/...` or `qa/mobile-locators/...` for bulk content.
