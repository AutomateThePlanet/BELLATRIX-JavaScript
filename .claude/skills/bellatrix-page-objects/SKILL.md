---
name: bellatrix-page-objects
description: Create or extend BELLATRIX web page objects (the Map / Asserts / Page triad under example/src/pages). Use whenever a test needs a page, element locator, page action or page assertion that does not exist yet.
---

# BELLATRIX page objects

Every page is three files in its own folder, `example/src/pages/<name>page/`:

| File | Extends | Holds |
|---|---|---|
| `<Name>PageMap.ts` | `WebPageMap` | element getters only, no logic |
| `<Name>PageAsserts.ts` | `WebPageAsserts<<Name>PageMap>` | `async` assertion methods built on `validate(...)` |
| `<Name>Page.ts` | `WebPage<Map, Asserts>`, decorated with `@Page(Map, Asserts)` | `url`, `waitForPageLoad()`, business actions |

Export the page (and any data types) from `example/src/pages/index.ts`. Copy the structure of `example/src/pages/cartpage/` as the reference implementation; read it before writing a new page.

## Map

```ts
import { Anchor, Button, PasswordField, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class LoginPageMap extends WebPageMap {
    get userNameTextField() {
        return this.create(TextField).byId('username');
    }

    get passwordField() {
        return this.create(PasswordField).byId('password');
    }

    get loginButton() {
        return this.create(Button).byCss('[type="submit"]');
    }

    getMenuLinkByName(name: string) {
        return this.create(Anchor).byXpath(`//nav//a[text()="${name}"]`);
    }
}
```

- Static elements are `get` accessors; parameterised elements are `getXByY(arg)` methods.
- Lists use the `allBy...` variants and return a `ComponentsList` (`await list.count()`, `await list.get(i)`).
- Pick the most specific component class from `@bellatrix/web/components` (TextField, Button, Anchor, CheckBox, RadioButton, Select, Span, Div, Heading, Label, TextArea, EmailField, PasswordField, NumberInput, DateInput, ...). The class decides which `validate(...)` attributes and actions are available.
- Locator choice follows the `locator-strategies` skill.

Available finders on `this.create(X)`: `byId`, `byIdContaining`, `byIdEndingWith`, `byName`, `byNameEndingWith`, `byClass`, `byClassContaining`, `byCss`, `byXpath`, `byTag`, `byAttribute(attr, value)`, `byAttributeContaining(attr, value)`, `byInnerTextContaining`, `byLinkText`, `byLinkTextContaining`, `byValueContaining`, each with an `allBy...` twin.

## Asserts

```ts
import { WebPageAsserts } from '@bellatrix/web/pages';
import { LoginPageMap } from './LoginPageMap';

export class LoginPageAsserts extends WebPageAsserts<LoginPageMap> {
    async errorMessageIs(expected: string) {
        await this.map.errorAlert.validate('innerText').is(expected);
    }
}
```

Validators retry until the validation timeout from `bellatrix.config.ts`, so never add sleeps around them. Available: `is`, `isNot`, `equals`, `notEqual`, `contains`, `isGreaterThan`, `isLessThan`, `isGreaterThanOrEqual`, `isLessThanOrEqual`, `isTrue`, `isFalse`.

**Asserting absence.** Single-element finders wait for the element and throw once it's hidden or removed, so `validateIsNot('visible')` can't prove absence. Use an `allBy...` finder and a `Validator` that re-queries the list inside the lambda and counts visible items `.equals(0)`. Assert absence only after a positive assert that proves the state (e.g. validation ran), so it can't pass vacuously.

## Page

```ts
import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { LoginPageMap } from './LoginPageMap';
import { LoginPageAsserts } from './LoginPageAsserts';

@Page(LoginPageMap, LoginPageAsserts)
export class LoginPage extends WebPage<LoginPageMap, LoginPageAsserts> {
    protected override get url() {
        return 'https://demos.bellatrix.solutions/my-account/';
    }

    protected override async waitForPageLoad() {
        await this.map.loginButton.wait.toExist();
    }

    async login(user: string, password: string) {
        await this.map.userNameTextField.setText(user);
        await this.map.passwordField.setText(password);
        await this.map.loginButton.click();
        await this.app.browser.waitForAjax();
    }
}
```

- Actions describe user intent (`login`, `applyCoupon`), not mechanics (`clickButton2`).
- After actions that trigger XHR, call `await this.app.browser.waitForAjax()`; after navigation, `await this.app.browser.waitUntilPageLoadsCompletely()`.
- Data passed to actions is a `type` in its own file (see `PurchaseInfo.ts`), not a long parameter list.
- Tests reach pages through `await this.app.goTo(LoginPage)` (navigates) or `this.app.createPage(LoginPage)` (already there).

## House rules (enforced by eslint.config.mjs)

4-space indent, single quotes, semicolons, a newline at the end of the file, no `enum` (use `Object.freeze({...} as const)`), and every promise awaited (`no-floating-promises` is an error).

Before adding a page, search `example/src/pages` for an existing page or element covering the same screen, and extend it rather than duplicating it.
