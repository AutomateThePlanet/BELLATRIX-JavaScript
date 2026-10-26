# Implementation brief: Contact Form automation

> **Superseded in part (2026-10-23):** `inputValue.ts` and the `getValue()` workaround described below were removed by the framework fix; see `qa/briefs/2026-10-23-getvalue-fix.md`.

Written by test-architect for Plan #3 of `journal/2026-10-22-contact-form-automation.md` (moved here from the journal Agent Log by agent-doctor, D9). Decisions and deviations live in the journal; this file is the brief as written.

Files: `example/src/pages/contactformpage/{ContactFormPageMap,ContactFormPageAsserts,ContactFormPage,ContactFormInfo,inputValue}.ts`; export `ContactFormPage` and `ContactFormInfo` (types + const arrays) from `pages/index.ts`; `Categories.ts` += `ContactForm: 'ContactForm'`; `example/tests/ContactFormTests.test.ts`.

`ContactFormInfo.ts`: `PriceTiers = Object.freeze(['Bronze - $199.95','Silver - $299.95','Gold - $399.95'] as const)`, `Sessions` (Session 1-5), `OvernightStayOptions` (Yes, No), `RequiredFields` (`firstName,lastName,email,priceTier,sessions,overnightStay`); types `PriceTier = typeof PriceTiers[number]` etc., `RequiredField`; `type ContactFormInfo = { firstName?, lastName?, email?, priceTier?, sessions?: Session[], overnightStay?, receiveEmailUpdates?: boolean, comments? }` (all optional, partial fills).

Map (all locators verified for count 1 with Playwright MCP before commit):
| Getter | Component | Locator |
|---|---|---|
| `firstNameField` / `lastNameField` | TextField | `byId('wpforms-3347-field_1')` / `byId('wpforms-3347-field_1-last')` |
| `emailField` | EmailField (`setEmail`) | `byId('wpforms-3347-field_2')` |
| `getPriceTierRadio(tier)` | RadioButton | `` byCss(`input[name="wpforms[fields][3]"][value="${tier}"]`) `` |
| `getSessionCheckBox(session)` | CheckBox | `` byCss(`input[name="wpforms[fields][4][]"][value="${session}"]`) `` |
| `getOvernightStayRadio(option)` | RadioButton | `` byCss(`input[name="wpforms[fields][5]"][value="${option}"]`) `` |
| `emailUpdatesCheckBox` | CheckBox | `byName('wpforms[fields][6][]')` |
| `commentsTextArea` | TextArea | `byId('wpforms-3347-field_7')` |
| `submitButton` | Button | `byId('wpforms-submit-3347')` |
| `getErrorLabel(field: RequiredField)` | Label | `byAttribute('id', ids[field])`, private readonly `Record<RequiredField,string>`: `wpforms-3347-field_1-error`, `wpforms-3347-field_1-last-error`, `wpforms-3347-field_2-error`, `wpforms[fields][3]-error`, `wpforms[fields][4][]-error`, `wpforms[fields][5]-error` |
| `emailUpdatesErrorLabel` | Label | `byCss('#wpforms-3347-field_6-container label.wpforms-error')` (container-scoped: no id ever observed) |

`inputValue.ts`: `async function inputValue(field)` returning `await field.evaluate(el => el.value)` for TextField/EmailField/TextArea (type so it compiles). Used by Page guard and Asserts; no duplicate lambdas.

Page (`url` = `https://demos.bellatrix.solutions/contact-form/`; `waitForPageLoad` = `submitButton.wait.toExist()`):
- `fillForm(info: ContactFormInfo)`: sets only defined fields; sessions `check()` each; `receiveEmailUpdates` true→`check()`, false→`uncheck()`; then `commentsTextArea.focus()` so the last text field blurs (jQuery Validate clears errors on focusout; confirm with MCP for TC-CF-03). Never submits.
- `uncheckSession(session)`.
- `submitExpectingValidationErrors()`: reads `inputValue` of first and last name; if both `.trim()` non-empty, `throw new Error('Safety rule (journal 2026-10-22-contact-form-automation): first or last name must be empty before Submit')`; else `submitButton.click()`. No other method clicks Submit. No `waitForAjax` (client-side validation).

Asserts (expected texts as private consts: `'This field is required.'`, `'Please enter a valid email address.'`):
`requiredErrorShown(field)`, `invalidEmailErrorShown()` (`validate('innerText').is(...)`); `noErrorShown(field)`, `emailUpdatesHasNoError()` (`validateIsNot('visible')`); `formStillDisplayed()` (submit + first name `validateIs('visible')`, TC-CF-01 step 1); `priceTierSelected(tier)`, `overnightStaySelected(option)` (chosen `validateIs('checked')`, every other option `validateIsNot('checked')`); `sessionsChecked(expected: Session[])` (all 5 checked/unchecked); `emailUpdatesChecked(expected: boolean)`; `fieldValues(info)` for first/last/email/comments via `new Validator(() => inputValue(x), 'value').is(...)` (`@bellatrix/web/validators`).
Constraint: in any test, assert a positive error first, then `noErrorShown`, so absence is never checked before validation ran.

Tests (`@TestClass @Category(Categories.ContactForm) ContactFormTests extends WebTest`; configure like ProductPurchaseTests (BDD logging, ScreenshotOnFail); `afterEach` clearCookies; each test starts `await this.app.goTo(ContactFormPage)`):
| TC | Method | Notes |
|---|---|---|
| 01 | `requiredErrorsShown_when_emptyFormSubmitted` | loop `RequiredFields` → `requiredErrorShown`; `formStillDisplayed` |
| 02 | `onlyMissingNameShowsError_when_otherFieldsFilled(missing: 'firstName' \| 'lastName')` | `@TestCase('firstName')`, `@TestCase('lastName')`; other 5 → `noErrorShown` |
| 03 | `requiredErrorsDisappear_when_fieldsFilled` | stepwise `fillForm({...})` partials; first name never filled |
| 04 | `invalidEmailErrorShown_when_emailFormatInvalid(email)` | `@TestCase('abc')`, `('abc@')`, `('user@domain')` |
| 04 | `emailErrorCleared_when_validEmailSubmitted` | step 2; also `requiredErrorShown('firstName')` |
| 06 | `textFieldsKeepEnteredValues_when_typed` | `fieldValues` |
| 07 | `onlySelectedPriceTierChecked_when_tierSelected(tier)` | 3 `@TestCase` rows |
| 08 | `onlySelectedOvernightOptionChecked_when_switched` | Yes then No |
| 09 | `sessionCheckBoxesToggleIndependently` | check 1,3,5; uncheck 3 |
| 10 | `emailUpdatesCheckBoxToggles_when_checkedAndUnchecked` | steps 1-2 |
| 10 | `noErrorForEmailUpdates_when_emptyFormSubmitted` | step 3; `requiredErrorShown('firstName')` first |
Every method line ends `// TC: TC-CF-0n`. Tests never reference `.map` or `this.app.create` (review: `grep -n '\.map\.\|app\.create' example/tests/ContactFormTests.test.ts` must be empty = must fix otherwise).
