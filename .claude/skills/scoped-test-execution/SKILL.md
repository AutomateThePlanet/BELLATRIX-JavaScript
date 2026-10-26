---
name: scoped-test-execution
description: Run exactly the BELLATRIX tests that matter for a change (by file, suite, test name or category), then summarise and classify the results cheaply. Use whenever tests need to be run or a run's results need to be analysed.
---

# Scoped test execution and results analysis

The suite is the cheap, deterministic part of the system. Run it rather than "checking in the browser".

## Prerequisites (once per clone)

```bash
npm ci                                  # repo root; installs the example and the local @bellatrix packages
npx playwright install chromium msedge  # browsers used by example/bellatrix.config.ts
```

`example/bellatrix.config.ts` sets the browser (`edge` by default), `headless`, the base URL and timeouts. Don't edit it to make a run pass. If a run needs different settings, say so in the Journal.

## Running: always from `example/`

| Scope | Command |
|---|---|
| CI suite (what the pipeline runs) | `npm test` (that is `bellatrix ./tests filter --category CI`) |
| One file | `npx bellatrix ./tests/CouponTests.test.ts` |
| One suite (class) | `npx bellatrix ./tests filter --suiteName CouponTests` |
| One test | `npx bellatrix ./tests filter --testName validCouponReducesTotal_when_appliedToSingleRocket` |
| Several tests | `npx bellatrix ./tests filter --testName '(testA\|testB)'` |
| Tests by prefix | `npx bellatrix ./tests filter --testName 'requiredErrors.*'` |
| A category | `npx bellatrix ./tests filter --category Debug` |

How the filters behave (from `@bellatrix/core/src/test/_common.ts`):
- **Values are full-match regexes** (`^...$` is added unless you supply anchors). A partial name matches nothing: use `--testName 'onlyMissingName.*'` for a prefix. A run with 0 passed and every test skipped means the filter matched nothing; fix it, don't report it.
- Filters combine with AND. Tests that don't match are reported as **skipped**, not omitted.
- `--category` matches the test's categories joined with commas, so a test with both `CI` and `Debug` does **not** match `--category CI`. Use `--category '.*CI.*'` in that case, or keep one category per test.

Use the narrowest scope that covers the change: the new or changed tests first, then the suites that use the pages you touched (search `example/tests` for the page class names), then `npm test` before handing over.

## Summarising

Every run writes JUnit XML to `example/reports/result.xml` and Allure results to `example/allure-results/`. For triage, prefer the **allure-results-analysis** skill: it shows the failing step and locator, and groups shared causes. For a quick pass/fail line, summarise the JUnit file. Don't read the raw XML:

```bash
node .claude/skills/scoped-test-execution/scripts/summarize-junit.mjs example/reports/result.xml   # from the repo root
```

It prints a `Result: x/y passed, ...` line plus one line per failure or skip, and exits 1 if anything failed. Paste the `Result:` line into the Journal as evidence.

## Classifying each failure

| Class | Signal | Next step |
|---|---|---|
| **Locator drift** | "element not found" / timeout finding a component, the page otherwise loads | automation-engineer fixes the Map (`locator-strategies`) |
| **Timing** | passes on rerun, or fails at different steps | fix waits in the page (`waitForPageLoad`, `waitForAjax`); never sleeps |
| **Product bug / change** | validation failed with a real, different value (`Validating innerText. expected X, got Y`) | don't touch the test; report with evidence; Jira only if the plan allows |
| **Test bug** | wrong data, wrong expectation versus the test case, order dependence | automation-engineer fixes the test |
| **Environment** | DNS or HTTP errors, site down, browser not installed, report missing | report; don't retry endlessly |

Rerun a failed test **once** in isolation to separate timing from consistent failures. Two consistent failures with the same message is a real failure; don't keep rerunning.

## Rules

- Never commit `@Only`, and never comment out assertions to get green.
- Never change expected values to match what the app shows. The test case owns the expected result.
- `example/reports/`, `example/allure-results/` and `example/allure-report/` are git-ignored. Evidence goes into the Journal as text.
