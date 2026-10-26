---
name: bellatrix-tests
description: Write BELLATRIX web test classes (WebTest, @TestClass, @Test, @Category, @TestCase) in example/tests. Use when implementing designed test cases as automated tests, or when changing existing tests.
---

# BELLATRIX tests

Tests live in `example/tests/<Feature>Tests.test.ts`, one class per feature. `example/tests/ProductPurchaseTests.test.ts` is the reference; read it first.

```ts
import { Test, TestClass } from '@bellatrix/web/test';
import { Category } from '@bellatrix/core/decorators';
import { WebTest } from '@bellatrix/web/infrastructure';

import { Categories } from '../src/Categories';
import { MainPage, CartPage } from '../src/pages';

@TestClass
@Category(Categories.CI)
export class CouponTests extends WebTest {
    override async afterEach() {
        await this.app.cookies.clearCookies();
    }

    @Test
    async validCouponReducesTotal_when_appliedToSingleRocket() { // TC: DEMO-123
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.addRocketToShoppingCart('Falcon 9');

        const cartPage = this.app.createPage(CartPage);
        await cartPage.applyCoupon('happybirthday');

        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.totalPrice(expectedTotalFromTestCase);
    }
}
```

## Rules

- **One behaviour per test.** The name says the behaviour and the condition: `<expectedResult>_when_<condition>`, or the `camelCase` style already in the file you are editing.
- **Trace every test** to its test case with a trailing `// TC: <id>` comment on the method line (a Jira/Xray key or a `qa/test-cases` id).
- **Arrange / act / assert through pages.** Tests call page actions and `page.asserts.*`. No raw locators, no `this.app.create(...)` in finished tests (the two `_first` / `_second` tests in the reference file are framework demos, not a pattern to copy).
- **No sleeps.** Waiting is the job of `waitForPageLoad`, `waitForAjax` and the retrying validators.
- **Independent tests.** Each test sets up its own state; clean shared state in `afterEach` (`clearCookies`, `clearLocalStorage` if needed). Never rely on test order.
- **Data-driven**: when the same steps run with different data, use `@TestCase(arg1, arg2)` (from `@bellatrix/core/decorators`) on a method with parameters instead of copy-pasting tests. **`@TestCase` rows replace `@Test`; never put both on one method.** `@TestCase` already registers the test, and `@Test` only accepts methods without parameters, so `@Test` on a parameterised method is TS1241 (red underline in the IDE).

  ```ts
  @TestCase('abc')
  @TestCase('user@domain')
  async invalidEmailErrorShown_when_emailFormatInvalid(email: string) { // TC: TC-CF-04
  ```
- **Categories** (`example/src/Categories.ts`): `CI` runs in the pipeline (`npm test` filters `--category CI`). New tests start in `Categories.Debug` until they've passed three runs in a row, then move to `CI`. Known-unstable tests go to `Flaky` with the reason recorded in the task journal (Decisions). To add a category, extend the frozen object; never use an `enum`.
- `@Only` and `@Ignore` exist for local debugging. Never commit `@Only`. Commit an `@Ignore` only for a confirmed defect: method-level, with a trailing `// BUG-<KEY>-NN` comment and the Defects entry (bug-reporting skill).
- Plugins and hooks (`addPlugin(ScreenshotOnFailPlugin)`, `ExtraWebHooks.addComponentBDDLogging()`) are configured in `override async configure()`, after `await super.configure()`.

## Definition of done for a test

1. It traces to a test case (`// TC:`).
2. It passed locally via the `scoped-test-execution` skill. Paste the summary line into the Journal.
3. It fails for the right reason: break the expected value once (locally, not committed) and confirm the assertion message is readable.
4. `npx eslint <changed files>` (run from the repo root) reports nothing, and `npx tsc --noEmit -p example 2>&1 | grep -E '^example/'` (repo root) prints nothing. Any TS error in `example/` is a finding (TS1241 = decorator signature mismatch, e.g. `@Test` on a `@TestCase` method); never dismiss it as framework noise. The 6 TS2313 errors in `@bellatrix/web/src/components/core/WebComponent.ts` are pre-existing; if you changed `@bellatrix/*` files, also grep for their paths.

Expected values come from the test case's expected results, never from what the application currently shows. If they disagree, that's a finding for the Journal, not a value to copy into the test.
