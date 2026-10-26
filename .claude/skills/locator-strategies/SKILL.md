---
name: locator-strategies
description: Choose stable locators for BELLATRIX web components and Appium elements. Use when adding or fixing an element in a page Map, when a test fails with "element not found", or when harvesting locators with the Playwright or Appium MCP.
---

# Locator strategies

A locator is part of the test's contract with the application. Choose the one least likely to change when the page is restyled or re-ordered.

## Web priority (BELLATRIX finder in brackets)

1. **Unique id** that is not generated: `byId('billing_email')`. Reject ids that look generated (`ember123`, `react-select-7-input`, GUID suffixes); for those use `byIdEndingWith` / `byIdContaining` on the stable part.
2. **Test attribute** if the app has one: `byAttribute('data-testid', 'place-order')`.
3. **name** for form controls: `byName('username')`.
4. **Short CSS on a semantic attribute**: `byCss('[type="submit"]')`, `byCss('[value*="Apply coupon"]')`. Prefer `*=` contains-matching only when the full value carries noise.
5. **Link text** for navigation links: `byLinkText('My account')`.
6. **XPath** only when you need text plus structure, e.g. a card found by its heading: `byXpath('//h2[text()="Falcon 9"]/parent::a[1]')`. Anchor on text or ids, never on position (`/div[3]/span[2]`).

Never use: absolute XPath, index-based paths, layout classes (`col-md-6`, `mt-2`), or styling hashes (`css-1x2y3z`).

## Rules

- A locator must match **exactly one** element (or the intended list for `allBy...`). Verify with the Playwright MCP before committing it: `browser_snapshot`, then `browser_evaluate` with `document.querySelectorAll(css).length` (or an XPath `evaluate` count).
- Parameterise instead of duplicating: `getProductByName(name)` rather than `falcon9Product`, `saturnVProduct`.
- Name the getter after what the element **is** to the user (`placeOrderButton`), not how it is found (`submitCss`).
- If the only stable option is fragile, still use the best one available, and add a line to the Journal under **Risks** suggesting the dev team add a `data-testid`.

## Mobile (Appium MCP)

Priority: `accessibility id` > `id` (Android `resource-id`, iOS `name`) > `-android uiautomator` / `-ios predicate string` > `-ios class chain` > XPath (last resort; slow and brittle). Confirm uniqueness with `appium_find_elements` before recording a locator. Record them in the locator inventory format described in the `appium-mcp` skill.

## When a locator breaks

1. Reproduce with the Playwright MCP on the same URL and take a snapshot.
2. Decide: has the element **moved/changed** (fix the locator), or has the **behaviour** changed (that's a product bug or a requirement change, so do not "fix" the test to pass).
3. Fix it in the Map only. Tests and pages never contain raw locators, except throwaway exploration.
4. Log the change and the reason in the Journal.
