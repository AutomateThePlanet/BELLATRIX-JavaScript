# Implementation brief: Promotions page and coupon automation
Journal: `journal/2026-10-23-promotions-coupons-automation.md` (Plan #2, test-architect)  |  Test cases: `qa/test-cases/promotions-coupons.md` (TC-PC-01..07)

## Files
| File | Change |
|---|---|
| `example/src/pages/promotionspage/PromotionsPageMap.ts` / `PromotionsPageAsserts.ts` / `PromotionsPage.ts` | new triad |
| `example/src/pages/index.ts` | add `export * from './promotionspage/PromotionsPage';` |
| `example/src/pages/cartpage/CartPageMap.ts` / `CartPageAsserts.ts` / `CartPage.ts` | **additive only**: append new members, don't edit or reorder existing ones (AC2) |
| `example/src/Categories.ts` | add `Coupons: 'Coupons',` (not CI, AC4) |
| `example/tests/CouponTests.test.ts` | new class `CouponTests`, `@Category(Categories.Coupons)` |

## Step → page.method
| TC | Step | Page / method | Kind |
|---|---|---|---|
| 01 | open Promotions | `this.app.goTo(PromotionsPage)` (url `https://demos.bellatrix.solutions/welcome/`, `waitForPageLoad` = `couponButton.wait.toExist()`) | new page |
| 01 | heading, button | `asserts.headingIs('Promotions')`, `asserts.couponButtonShown('Do you want 5% off for your BD?')` (visible + innerText) | new |
| 02 | click, read, accept | `promotionsPage.openCouponAlert()` → `asserts.couponAlertMessageIs('Try the coupon- happybirthday')` → `promotionsPage.acceptAlert()` → `asserts.couponButtonShown(...)` (still on page) | new (see Dialog) |
| 03–07 | cart with Falcon 9 x1 | private test helper `openCartWithFalcon9()`: `this.app.createPage(MainPage).addRocketToShoppingCart('Falcon 9')` then `return this.app.createPage(CartPage)` | reuse |
| 03, 04, 06, 07 | apply coupon | `cartPage.applyCoupon(code)` | reuse |
| 05 | empty coupon | `cartPage.applyCoupon('')` | reuse |
| 03 | success message | `asserts.couponAppliedSuccessfully()` | reuse |
| 03 | discount row | `asserts.couponDiscountLabelIs('happybirthday', 'Coupon: happybirthday')`, `asserts.couponDiscountIs('happybirthday', '-2.50€')` | extend |
| 03, 07 | subtotal, VAT | `asserts.subtotalIs('50.00')`, `asserts.vatIs('9.50' / '10.00')` (append `€`, same convention as `totalPrice`) | extend |
| 03, 04, 05 | total | `asserts.totalPrice('57.00' / '60.00')` | reuse |
| 04 | invalid | `asserts.couponDoesNotExist('invalidcoupon')` → `Coupon "invalidcoupon" does not exist!` | extend |
| 05 | empty | `asserts.couponCodeRequired()` → `Please enter a coupon code.` | extend |
| 06 | twice | `asserts.couponAlreadyApplied()` → `Coupon code already applied!` | extend |
| 04, 06, 07 | discount row count | `asserts.couponDiscountRowCountIs(0 / 1)` (visible-count `Validator`, ContactFormPageAsserts `noVisibleLabels` pattern) | extend |
| 06, 07 | total unchanged / restored | `const total = await cartPage.getTotal()` (reuse) then `asserts.totalIs(total)` (raw string, no `€` appended) | extend |
| 07 | remove | `cartPage.removeCoupon('happybirthday')`, `asserts.couponRemovedSuccessfully()` → `messageAlert` is `Coupon has been removed.` | extend |

## New Map members (verify each locator count = 1 with the Playwright MCP)
- Promotions: `heading` = `Heading.byCss('h1.entry-title')`; `couponButton` = `Button.byId('couponBtn')` (verified count 1).
- Cart: `errorNotice` = `Div.byCss('ul.woocommerce-error li')`; `subtotalSpan` = `Span.byCss('tr.cart-subtotal .woocommerce-Price-amount')`; `vatSpan` = `Span.byCss('tr.tax-total .woocommerce-Price-amount')`; `couponDiscountRows` = `Div.allByCss('tr.cart-discount')`; `getCouponDiscountLabelByCode(code)` = `Div.byCss(\`tr.coupon-${code} th\`)`; `getCouponDiscountCellByCode(code)` = `Div.byCss(\`tr.coupon-${code} td\`)`; `getRemoveCouponLinkByCode(code)` = `Anchor.byCss(\`a.woocommerce-remove-coupon[data-coupon="${code}"]\`)`.
- No Table-row or list-item component exists in `@bellatrix/web/components`; `Div` is the accepted generic (only `innerText` and visibility are needed).

## Dialog (TC-PC-02): verified live 2026-10-23
`PlaywrightWebElement.click()` **does not return while the alert is open**: it resolves only when the controller's 5 s auto-dismiss fires, and by then `_dialog` is cleared, so `await click(); await app.dialog.getMessage()` throws `Dialog not found.` (probe: dialog event at 161 ms, click returned at 5205 ms). Without a framework change, it goes like this:
- **Page** `openCouponAlert()`: `this.pendingAlertClick = this.map.couponButton.click();` (private field `Promise<void> | undefined`, assigned, not awaited here; that's legal under `no-floating-promises`). Comment why.
- **Asserts** `couponAlertMessageIs(expected)`: `new Validator(() => resolve(App).dialog.getMessage(), 'alert message').is(expected)`. `waitUntil` retries while `getMessage` throws, so it waits for the dialog. Asserts reach the service via `resolve(App)` (from `@bellatrix/core/utilities` + `@bellatrix/web/infrastructure`, the same as ContactFormPageAsserts).
- **Page** `acceptAlert()`: `await this.app.dialog.accept(); await this.pendingAlertClick;` (the page reaches the service through `this.app.dialog`). Clear the field afterwards.
- Read, assert and accept must happen within 5 s of the click: no other steps in between.

## Test class constraints
- Imports: `Test, TestClass` from `@bellatrix/web/test`; `Category, Ignore` from `@bellatrix/core/decorators`. `configure()` as in ContactFormTests (BDD logging, LogLifecycle, ScreenshotOnFail).
- `afterEach`: `await this.app.cookies.clearCookies();` (resets the Woo cart session). Each cart test builds its own cart; no test depends on another's coupon state.
- One `@Test` per TC, trailing `// TC: TC-PC-0n`. No `@TestCase` (no case shares steps with different data). No `this.app.create(...)`, no raw locators, no sleeps, no `@Only`.
- **No checkout:** never call `clickProceedToCheckout()` (AC5).
- TC-PC-03: `@Ignore` above `@Test`, with a comment because the decorator takes no arguments: `@Ignore // BUG-PC-01: coupon applies fixed 5.00€, not 5% (journal 2026-10-23-promotions-coupons-automation)`. The order doesn't matter: both write the same per-method metadata, and the runner registers it as `test.skip`. Keep its full assertions (expected 5% values); don't comment them out.
- TC-PC-06: don't hard-code `54.00` (that's the defect value, Standing Rule 4). Capture `getTotal()` after the first apply and assert it is unchanged, plus one discount row.
- TC-PC-07: capture `getTotal()` **before** applying; after removal assert `couponRemovedSuccessfully()` first, then 0 discount rows, `totalIs(captured)`, `subtotalIs('50.00')`, `vatIs('10.00')`.
- Done when: eslint clean on changed files, `npx tsc --noEmit -p example 2>&1 | grep -E '^example/'` prints nothing, and the scoped run `--category Coupons` gives 6 passed, 1 skipped.

## Risks
1. `couponDiscountIs` uses `validate('innerText').contains(expected)` on the `td`, because the cell text is `-<amount> [Remove]` (the minus sign sits outside the amount span). Confirm the td innerText live; if it differs (e.g. a non-breaking space), adjust the assert, not the expected value.
2. `removeCoupon` and `applyCoupon` are Woo AJAX chains (`remove_coupon` then the totals refresh). `waitForAjax` patches XHR lazily and can return between requests, so correctness relies on the retrying validators. Assert the message first, then the absence and totals.
3. The old success notice can still be in the DOM briefly after the next action. `messageAlert` asserts retry until the text matches, so this is fine; don't add `getMessageNotification()` reads.
4. `tr.coupon-${code}`: Woo builds the class with `sanitize_title`, so codes must be lowercase. Ours are.
5. A skipped test shows no reason in Allure (Ignore has no argument). Traceability is the code comment plus this journal.
