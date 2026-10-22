---
name: allure-results-analysis
description: Generate and analyse Allure reports for BELLATRIX runs. Summarises allure-results (failures with the failing step and locator, shared causes, flaky and slow tests) and classifies failures. Use after any test run, for triage of failures, flakiness and duration trends, or when someone asks for the Allure report.
---

# Allure reports and results analysis

## How Allure is wired here

- `example/bellatrix.config.ts` → `frameworkSettings.testSettings.allureSettings` (`isEnabled`, `resultsDirectory` default `./allure-results`, `cleanResultsDirectory` default `true`). Works with `testFramework: 'playwright'` only.
- The runner (`@bellatrix/runner/bellatrix.js`) adds `@bellatrix/runner/reporters/allure.js` (a wrapper around `allure-playwright`) next to the JUnit reporter. Every run writes **both** `example/reports/result.xml` and `example/allure-results/`.
- BELLATRIX `@Category` values become Allure **tags** (`CI`, `Debug`, `Flaky`).
- Each result has the full step tree, including the Playwright call and locator of every step (`locator.waitFor(css=#billing_email >> nth=0)`). That's the most useful triage data.

## 1. Analyse results (always first; cheap)

From the repo root:

```bash
node .claude/skills/allure-results-analysis/scripts/analyze-allure-results.mjs example/allure-results            # text
node .claude/skills/allure-results-analysis/scripts/analyze-allure-results.mjs example/allure-results --json     # for further processing
node .claude/skills/allure-results-analysis/scripts/analyze-allure-results.mjs example/allure-results --top=10    # more slow tests
```

It prints a `Result:` line, then per failed or broken test: the message, **failed at** (the deepest failing step), the **locator** of that step, and attachments. Then come **shared causes** (tests that failed with the same normalised message at the same locator), **flaky** tests (status changed between retries of the same test) and the **slowest** tests. Exit code 1 means at least one failed or broken test. Don't open the raw JSON files unless the summary is not enough. If you must, read one `*-result.json` and only the `statusDetails` and `steps` you need.

## 2. Classify

| Allure status | Meaning |
|---|---|
| `failed` | the test threw an error: a validation mismatch, a BELLATRIX "Element at … not found", or another error in test or page code |
| `broken` | an infrastructure-level failure (e.g. the test-level timeout from `testTimeout` was exceeded) |
| `skipped` | filtered out by the run's filter, or `@Ignore` |

`testTimeout` (300s in the example config) is far above the 30s `findElementTimeout` / `validationTimeout`, so BELLATRIX's own error normally surfaces first: `Element at <locator> not found.` for a missing element, `Validating <attribute>. …` for a value mismatch. A **broken** "Test timeout of …ms exceeded" means the test as a whole ran too long: look for loops, many slow steps, or a hanging page. Use the message and the **failed at** step together:

| failed at | Likely class | Owner |
|---|---|---|
| `locator.waitFor(<locator>)` or another locator action | locator drift, or the page didn't reach that state | automation-engineer (check with the Playwright MCP) |
| a validation step / `getAttribute` / `innerText` read repeated until the timeout | value mismatch: product bug or wrong expectation | compare with the test case; report or fix the test |
| `page.goto(...)` / `browserType.launch` | environment (site down, browser not installed) | report |
| Before Hooks / After Hooks | setup or teardown (browser start, cookies) | automation-engineer / environment |
| none (test body) | an error thrown in test or page code | automation-engineer |

Several tests sharing a cause means **one** root cause. Fix or report it once and list the affected tests. Flaky means timing or test isolation, never "rerun until green". Record it and move the test to `Categories.Flaky` only with a Journal note.

## 3. Generate the HTML report (for humans)

From `example/`:

```bash
npm run allure:generate   # allure generate ./allure-results --output ./allure-report
npm run allure:open       # serves ./allure-report locally
```

`allure-results/` and `allure-report/` are git-ignored. Attach or link the report; don't commit it. The report CLI is `allure` 3.x (npm, no Java needed).

## 4. Report

Put the `Result:` line, the shared causes and a one-line classification per failure into the task's Journal (or the reply, for small tasks). Recommended next action per failure: who acts, and what.
