# contact-form: Contact Form validation and field behaviour
Source: journal/2026-10-22-contact-form-automation.md  |  Designed: 2026-10-22  |  Techniques: EP, decision table, state transition, error guessing

Page: https://demos.bellatrix.solutions/contact-form/ (WPForms id 3347). Expected results are the observed live behaviour, accepted as baseline by the stakeholder (journal Clarification 2). Observed 2026-10-22.

## Observed behaviour (baseline)
- Validation is **client-side** (jQuery Validate); clicking Submit with an invalid form causes no page reload or network submit. URL stays the same.
- Required-field message, every field: `This field is required.` Rendered as `label.wpforms-error` with id `<fieldId>-error` (e.g. `wpforms-3347-field_1-error`, `wpforms-3347-field_1-last-error`, `wpforms[fields][3]-error`, `wpforms[fields][4][]-error`, `wpforms[fields][5]-error`), placed after the field/group it belongs to. First and last name each have their own error label.
- Invalid email message: `Please enter a valid email address.` (label `wpforms-3347-field_2-error`). Shown on Submit and also on blur.
- Errors clear per field as soon as that field is given a valid value (radio/checkbox click, text typed + blur).
- No radio or checkbox is pre-selected on load. reCAPTCHA is v2 checkbox type (`wpforms-is-recaptcha-type-v2`); it was never reached because Submit was only clicked with required fields invalid.
- Labels: `Name *` (sublabels First, Last), `Email *`, `Which access pass would you like to purchase? *` (Bronze - $199.95, Silver - $299.95, Gold - $399.95), `Which sessions do you plan on attending? *` (Session 1-5), `Will you be staying overnight? *` (Yes, No), optional checkbox `I would like to receive email updates regarding future conferences`, `Comments or Questions`.
- Safety: every case that clicks Submit leaves at least one required field invalid (first name left empty in TC-04/05), so reCAPTCHA is never reached and nothing is sent.

## TC-CF-01: Submitting an empty form shows a required error for every required field
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Contact form freshly loaded, nothing filled
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Click Submit | | Form is not submitted (URL unchanged) |
| 2 | Read first name error | | `This field is required.` |
| 3 | Read last name error | | `This field is required.` |
| 4 | Read email error | | `This field is required.` |
| 5 | Read price tier error | | `This field is required.` |
| 6 | Read sessions error | | `This field is required.` |
| 7 | Read Yes/No error | | `This field is required.` |

## TC-CF-02: A single missing name field shows only its own error
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded. Fill every other required field, leave the one under test empty, then Submit. Only name fields are used as the single-missing case: a name is always left empty, so client validation always fails and reCAPTCHA is never reached. Single-missing email/radio/checkbox cases are deliberately not run on their own (they are covered with first name empty in TC-CF-03/04) to keep the safety rule.
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Fill all except first name; Submit | first name empty | Only first name shows `This field is required.` |
| 2 | Fill all except last name; Submit | last name empty | Only last name shows `This field is required.` |

## TC-CF-03: Error for a required field disappears when the field is filled
- Covers: AC1
- Priority: Medium
- Verdict: automate-web
- Preconditions: Empty form submitted once (TC-CF-01 state); first name stays empty throughout
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Select price tier Silver | Silver - $299.95 | Price tier error gone; other errors remain |
| 2 | Check Session 1 | Session 1 | Sessions error gone |
| 3 | Select overnight No | No | Yes/No error gone |
| 4 | Type last name | Smith | Last name error gone |
| 5 | Type valid email | user@example.com | Email error gone |
| 6 | Check remaining errors | | Only first name shows `This field is required.` |

## TC-CF-04: Invalid email formats show the email format error
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded; first name left empty; Submit clicked each time
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Enter email and click Submit (repeat per data row) | `abc`, `abc@`, `user@domain` | Email error is `Please enter a valid email address.` (not the required message) |
| 2 | Enter valid email and Submit | `user@example.com` | Email error is no longer shown; first name still shows required error |

## TC-CF-05: Email validated on blur
- Covers: AC1
- Priority: Low
- Verdict: automate-later
- Preconditions: Form loaded, no Submit click
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Type invalid email, leave field | `bad` | `Please enter a valid email address.` appears without Submit |

Reason: depends on blur timing; low value over TC-CF-04.

## TC-CF-06: Text inputs and comments accept and keep input
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded; no Submit
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Type first name | John | Field value is John |
| 2 | Type last name | Smith | Field value is Smith |
| 3 | Type email | john.smith@example.com | Field value is the same |
| 4 | Type comments | Hello, this is a test. | Textarea value is the same |

## TC-CF-07: Price tier radios are mutually exclusive
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded; no Submit
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Select each of Bronze, Silver, Gold in turn (data rows) | `Bronze - $199.95`, `Silver - $299.95`, `Gold - $399.95` | Selected one is checked, other two unchecked |

## TC-CF-08: Yes/No radios are mutually exclusive
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded; no Submit
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Select Yes | Yes | Yes checked, No unchecked |
| 2 | Select No | No | No checked, Yes unchecked |

## TC-CF-09: Session checkboxes can be checked and unchecked independently
- Covers: AC1
- Priority: High
- Verdict: automate-web
- Preconditions: Form loaded; no Submit
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Check Session 1, 3, 5 | | Those three checked, Session 2 and 4 unchecked |
| 2 | Uncheck Session 3 | | Session 1 and 5 remain checked, 3 unchecked |

## TC-CF-10: Optional email-updates checkbox toggles and is not required
- Covers: AC1
- Priority: Medium
- Verdict: automate-web
- Preconditions: Form loaded
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Check the email updates checkbox | | Checked |
| 2 | Uncheck it | | Unchecked |
| 3 | Click Submit on the otherwise empty form | | No error shown for this checkbox (no `wpforms-error` in its field) |

## TC-CF-11: Successful submission (not designed)
- Covers: none (out of scope)
- Verdict: manual/exploratory
- Excluded by stakeholder: reCAPTCHA v2 and no data may be sent to the demo site.

## Coverage
| AC | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| AC1 required errors | x | x | x | | | | | | | x |
| AC1 invalid email | | | | x | x | | | | | |
| AC1 fill/select every field | | | | | | x | x | x | x | x |
