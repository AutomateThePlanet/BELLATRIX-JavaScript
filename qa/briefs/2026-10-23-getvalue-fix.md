# Brief: getValue() reads the live value (journal 2026-10-22-contact-form-automation, Plan #7 → #8)

Approved framework change: Decisions, 2026-10-23 ("fix the framework bug").

## 1. Component groups

| Group | Components | getValue() reads | Why |
|---|---|---|---|
| A. Value-mode controls (14) | common/`TextField`, `TextArea`; advanced/`EmailField`, `PasswordField`, `SearchField`, `PhoneField`, `UrlField`, `NumberInput`, `DateInput`, `DateTimeInput`, `TimeInput`, `MonthInput`, `WeekInput`, `ColorInput` | **live value** (new `getInputValue()`) | For these the `value` attribute is only the *default*; typing, `fill()` and the components' own `el.value = ...` setters (`ColorInput.setColor`, `TimeInput.setTime`, `MonthInput`/`WeekInput`/`DateTimeInput` setters) change the property, not the attribute. `<textarea>` has no `value` attribute at all, so `TextArea.getValue()` is always `''`. Derived getters (`getEmail`, `getPassword`, `getNumber`, `getColor`, `getUrl`, `getTime`, `getMonth`, `getWeek`, `getSearch`, `getPhone`, `DateTimeInput.getDateTime`) inherit the fix. |
| B. Default-mode / reflected values (6) | common/`CheckBox`, `RadioButton`, `Button`, `Reset`, `Option`; advanced/`Progress` | **unchanged** (`getAttribute('value')`) | The value is a static identity (what the form submits when checked/selected/clicked), not user input; the property reflects the attribute, so there is no bug. Differences are only fallbacks we don't want silently changed: checkbox/radio property = `'on'` without the attribute, option property = its text without the attribute, indeterminate progress property = `0` (attribute → `NaN` today). Checked state is `isChecked()`/`isSelected()`, already live. |

Untouched: `RangeInput.getValue()` (already `valueAsNumber`), `DateInput.getDate()` (already `valueAsDate`), `Select` (no getValue).

## 2. Mechanism: one method on the controller abstraction

- `@bellatrix/web/src/infrastructure/browsercontroller/core/WebElement.ts`: add `abstract getInputValue(): Promise<string>;` next to `getAttribute`.
- `.../playwright/PlaywrightWebElement.ts`: `return await this._locator.inputValue();` (native; works for input/textarea/select; inherited by `PlaywrightShadowRootWebElement`, whose element handles share the method).
- `.../selenium/SeleniumWebElement.ts`: `return await this.evaluate<string>('el => el.value') ?? '';` (same pattern as its `focus`/`scrollIntoView`; `getProperty` exists at runtime but not in `@types/selenium-webdriver`, so it would need a cast).
- Group A components: `return await this.wrappedElement.getInputValue();` in `getValue()`. The `@BellatrixWebComponent` decorator already resolves `wrappedElement` and retries stale elements, so nothing else is needed.
- Do **not** add a public `getInputValue()` to `WebComponent`: every `get*` method becomes a `validate('<name>')` option on every component (incl. Div, Anchor), where it would throw.

Rejected: per-component `this.evaluate(el => el.value)` (14 copies of a string-serialised snippet, bypasses the native API); generic `getProperty(name)` (untyped, no Playwright locator equivalent, wider API than the bug needs); changing `getAttribute('value')` itself (breaks group B and attribute semantics everywhere).

## 3. Validation flow

`WebComponent.validate('value')` builds `new Validator(this.getValue.bind(this), 'value')` and re-calls it on every poll, so the fix reaches `validate('value')` (and `validate('email')`, `validate('number')`, ...) with no validator change. Callers found: only the components themselves and `example/src/pages/contactformpage` (via the `inputValue` workaround). `cartpage`/`ProductPurchaseTests` don't read values.

## 4. Compatibility risks (behaviour changes for group A only)

- Code that relied on `getValue()` returning the default/initial value after typing now gets the typed value (that was the bug).
- Sanitised values: invalid text in number/date/time/month/week inputs reads `''` (browser sanitisation); `ColorInput` without a `value` attribute reads `'#000000'` instead of `''`.
- Selenium: its `getAttribute` atom already returned the current value for most inputs, so Selenium users see little change; `TextArea` goes from `null` to `''`.
- `WebElement` gains an abstract method: any external `WebElement` subclass must implement it (none in this repo; package version 0.0.1).

## 5. Example-project follow-up (same Plan #8)

- Delete `example/src/pages/contactformpage/inputValue.ts`.
- `ContactFormPage.submitExpectingValidationErrors()`: `await this.map.firstNameField.getValue()` / `lastNameField.getValue()`; drop the import.
- `ContactFormPageAsserts.fieldValues()`: `await this.map.firstNameField.validate('value').is(info.firstName);` (same for last name, `emailField`, `commentsTextArea`); drop the `inputValue` import, keep `Validator` (still used by `urlUnchanged` and `noVisibleLabels`).
- `.claude/skills/bellatrix-page-objects/SKILL.md`: delete the whole "Known framework gaps" section (heading + bullet).
- Journal: the Decisions row "Typed-value asserts read the live DOM value via `component.evaluate`..." is superseded; the Decisions needed bullet is resolved (coordinator updates).

## 6. Verification

1. `npx eslint` (repo root) on the 3 controller files, the 14 group-A component files and the changed `contactformpage` files: exit 0.
2. `cd example && npx bellatrix ./tests filter --category ContactForm`: 16 passed, as before. TC-CF-06 (`textFieldsKeepEnteredValues_when_typed` → `fieldValues`) now exercises `validate('value')` on TextField, EmailField and TextArea; TC-CF-01..04 exercise the guard's `getValue()`.
3. Fail-once proof: temporarily restore `getAttribute('value')` in `TextField.getValue()` only; TC-CF-06 must fail (`Expected: <typed> But was: ''`); restore and confirm `diff` is clean.
4. `cd example && npm test` (CI category): no regressions.
5. No web-component unit tests exist (`@bellatrix/core/tests` is pure mocha, no browser); none are added in this task. Selenium path is compiled and linted but not executed (config uses `browserController: 'playwright'`).
