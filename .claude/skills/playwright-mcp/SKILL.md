---
name: playwright-mcp
description: Explore a web application with the Playwright MCP server to understand flows, harvest and verify locators, and reproduce failures. Use before writing page objects for an unknown screen, and when a web test fails for a reason that isn't obvious from the report.
---

# Playwright MCP for BELLATRIX

The `playwright` MCP server (`.mcp.json`) drives a real browser. It is for **exploration and evidence**, not for running the suite: repeatable execution belongs to BELLATRIX (`scoped-test-execution` skill). Every browser step costs tokens; a test run costs nothing.

## Tools you will use

| Need | Tool |
|---|---|
| Open a page | `browser_navigate` (use `webSettings.executionSettings.baseUrl` from `example/bellatrix.config.ts` as the root) |
| See the page structure | `browser_snapshot`: an accessibility tree with `ref`s. Prefer it to screenshots: it's cheaper and gives names and roles. |
| Act | `browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_hover`, `browser_press_key`, `browser_handle_dialog`, `browser_file_upload` |
| Wait | `browser_wait_for` (text appears or disappears) |
| Check a locator | `browser_evaluate` with `() => document.querySelectorAll('<css>').length`, or for XPath `() => document.evaluate('<xpath>', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength` |
| Read attributes for a locator | `browser_evaluate` returning `el.id`, `el.name`, `el.getAttribute('data-testid')`, `el.outerHTML.slice(0, 300)` for a candidate element |
| Evidence | `browser_take_screenshot` (only for the Journal or a bug report), `browser_console_messages`, `browser_network_requests` |
| Finish | `browser_close` |

`browser_run_code_unsafe` is disabled for all agents. Don't ask for it.

## Exploration procedure (new screen)

1. `browser_navigate` to the screen; `browser_snapshot`.
2. Walk the flow from the test case step by step, using the snapshot `ref`s to act. After each step, snapshot again and note: what changed, what was loaded asynchronously (spinners, XHR), and any dialogs.
3. For every element the test case touches, collect candidate locators with `browser_evaluate` and pick one following the `locator-strategies` skill. Confirm the count is exactly 1.
4. Write a short **screen inventory** into the task journal's Context (element, BELLATRIX component class, finder, notes), then hand off to page-object implementation.
5. `browser_close`.

## Failure reproduction procedure

1. Read the failing test and its page Map to get the URL, steps and locator.
2. Replay only up to the failing step with the MCP and snapshot there.
3. Classify the failure:
   - **Locator drift**: the element exists but the locator no longer matches. Fix the Map.
   - **Timing**: the element appears later than the wait allows. Fix `waitForPageLoad` or add `waitForAjax` in the page action; never a sleep.
   - **Product change or bug**: behaviour differs from the expected result. Do not change the test; report it.
   - **Environment**: the site is down, test data is missing, or there's a certificate or auth problem.
4. Record the classification and evidence in the Journal.

## Rules

- Don't enter real credentials or personal data. Use the test data defined in the test case.
- Don't submit irreversible actions (real payments, deleting shared data) outside a known test environment.
- Keep the session short: snapshot, act, snapshot. Don't take screenshots after every step.
