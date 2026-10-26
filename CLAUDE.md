# BELLATRIX-JavaScript

TypeScript test automation framework (`@bellatrix/*`) plus an example test project (`example/`), extended with an agentic QA layer (Claude Code agents and skills).

## Layout

| Path | What |
|---|---|
| `@bellatrix/core` | test infrastructure, decorators (`@Category`, `@TestCase`, `@Ignore`, `@Only`), settings, Playwright/Vitest adapters |
| `@bellatrix/web` | web components, find strategies, page objects (`WebPage`/`WebPageMap`/`WebPageAsserts`), services, validators |
| `@bellatrix/appium` | Appium drivers only (sessions, device commands); **no element finding or page objects yet** |
| `@bellatrix/runner` | `bellatrix` CLI; reporters, incl. `reporters/allure.js` |
| `@bellatrix/extras/web` | plugins (screenshot on fail, lifecycle logging) and hooks |
| `example/` | test project: `src/pages/<name>page/` (Map / Asserts / Page), `tests/*.test.ts`, `bellatrix.config.ts` |
| `qa/` | QA artifacts: test cases, mobile locator inventories, Appium capabilities |
| `JOURNAL.md`, `journal/` | Standing Rules + index; one task journal per planned multi-agent task |

## Commands

```bash
npm ci                                              # repo root, once
cd example && npm test                              # CI category → reports/result.xml + allure-results/
cd example && npx bellatrix ./tests/X.test.ts       # one file
cd example && npx bellatrix ./tests filter --testName <regex>     # also --suiteName <regex>, --category <regex>
cd example && npm run allure:generate               # HTML report → allure-report/
node .claude/skills/allure-results-analysis/scripts/analyze-allure-results.mjs example/allure-results
node .claude/skills/task-cost/scripts/task-cost.mjs --since=<ISO>          # token cost per agent/model of the current session
npx eslint <files>                                  # repo root; covers .ts files in the TS project
```

## Code conventions (eslint.config.mjs)

4-space indent, single quotes, semicolons, newline at end of file, no `enum` (use `Object.freeze({...} as const)`), every promise awaited. Page objects are always the Map / Asserts / Page triad, and tests never contain raw locators.

## Agentic QA framework

Start QA work with **`claude --agent qa-coordinator`**. The coordinator thinks critically about the request, asks clarifying questions and gets the plan approved before any work starts. Then it creates a task journal and dispatches:

| Agent (`.claude/agents/`) | Role |
|---|---|
| `qa-coordinator` | gates (critical thinking → clarification → plan approval), journal, dispatch, report |
| `test-analyst` | requirements (Jira/Confluence) → test cases in `qa/test-cases/` |
| `test-architect` | structure decisions, implementation brief, code review |
| `automation-engineer` | page objects + tests, verified with the Playwright/Appium MCP |
| `test-executor` | scoped runs, Allure/JUnit analysis, failure classification |
| `agent-doctor` | after every delivery: reviews the journal for agent issues, suggests improvements, applies approved ones |

If the user asks for the coordinator in a normal session, don't dispatch `qa-coordinator` as a subagent (it stops after gate 1). Suggest `claude --agent qa-coordinator`, or read `.claude/agents/qa-coordinator.md` and follow it inline, gates and journal included.

Skills (`.claude/skills/`): `journal`, `bellatrix-page-objects`, `bellatrix-tests`, `locator-strategies`, `test-case-design`, `playwright-mcp`, `appium-mcp`, `atlassian-jira`, `scoped-test-execution`, `allure-results-analysis`, `bug-reporting`, `task-cost`.

MCP servers (`.mcp.json`): `playwright` (`@playwright/mcp`), `appium` (`appium-mcp`; configure `qa/appium-capabilities.json` and `ANDROID_HOME`), `atlassian` (official remote server; authenticate via `/mcp`).

## Environment notes

- `example/bellatrix.config.ts` uses `browser: 'edge'`; machines without Microsoft Edge need `npx playwright install msedge`, or a local switch to `chrome`.
