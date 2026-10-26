# promotions-coupons: Promotions page coupon button and Cart coupon redemption
Source: journal/2026-10-23-promotions-coupons-automation.md  |  Designed: 2026-10-23  |  Techniques: EP, state transition, error guessing

Status: READY. TC-PC-03 is affected by defect BUG-PC-01 (the coupon applies a fixed 5.00€ instead of 5%). See the task journal; stakeholder decision 2026-10-23.

Pages: https://demos.bellatrix.solutions/welcome/ (Promotions) and https://demos.bellatrix.solutions/cart/. Expected results are the observed live behaviour (approved baseline, journal Clarification 2). Observed 2026-10-23 with one Falcon 9 (sale price 50.00 EUR) at quantity 1.

## Observed behaviour (baseline)
- Promotions page: title `Promotions – Bellatrix Demos`, `<h1>` `Promotions`. `button#couponBtn`, visible, text `Do you want 5% off for your BD?`. Click opens a JS `alert` with the message `Try the coupon- happybirthday` (no page navigation).
- Cart, Falcon 9 x1, no coupon: Subtotal `50.00€`, VAT `10.00€`, Total `60.00€`.
- Messages (all in `.woocommerce-notices-wrapper`; errors are `ul.woocommerce-error[role=alert] > li`, success `div.woocommerce-message[role=alert]`):
  - Success: `Coupon code applied successfully.`
  - Invalid (`invalidcoupon`): `Coupon "invalidcoupon" does not exist!`
  - Empty: `Please enter a coupon code.`
  - Already applied: `Coupon code already applied!`
  - Removed: `Coupon has been removed.`
- After `happybirthday`: Subtotal `50.00€`, row `Coupon: happybirthday` `-5.00€` (10% of the subtotal, not 5%), VAT `9.00€`, Total `54.00€` (was 60.00€).
- Invalid, empty and already-applied attempts leave the totals unchanged. Removal restores Subtotal 50.00€, VAT 10.00€, Total 60.00€.
- Locators seen: discount row `tr.cart-discount.coupon-happybirthday` (generic `tr.cart-discount`), its label `th` text `Coupon: happybirthday`, amount `td[data-title^="Coupon"]`; remove link `a.woocommerce-remove-coupon` (`data-coupon="happybirthday"`, href `/cart/?remove_coupon=happybirthday`, text `[Remove]`); error notice `ul.woocommerce-error li`; success `.woocommerce-message`; coupon input `#coupon_code`; apply `button[name=apply_coupon]` (text `Apply coupon`); totals `.cart_totals` rows `tr.cart-subtotal`, `tr.tax-total`, `tr.order-total`.
- Safety: Checkout is never opened and no order is placed.

## TC-PC-01: Promotions page loads with the coupon button
- Covers: AC1a
- Priority: High
- Verdict: automate-web
- Preconditions: none
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Open the Promotions page | /welcome/ | Heading `Promotions` |
| 2 | Check the coupon button | | Visible, text `Do you want 5% off for your BD?` |

## TC-PC-02: Coupon button shows the coupon alert
- Covers: AC1b
- Priority: High
- Verdict: automate-web
- Preconditions: Promotions page open. The alert auto-dismisses after 5 s: read and accept it immediately.
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Click the coupon button | | A JS alert opens |
| 2 | Read the alert message | | `Try the coupon- happybirthday` |
| 3 | Accept the alert | | Alert closed, still on Promotions page |

## TC-PC-03: Advertised coupon applies a discount in the Cart
- Covers: AC1c
- Priority: High
- Verdict: automate-web, `@Ignore` because of defect BUG-PC-01 (journal `journal/2026-10-23-promotions-coupons-automation.md`)
- Preconditions: Cart contains Falcon 9 x1 (Subtotal 50.00€, VAT 10.00€, Total 60.00€)
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Apply coupon | happybirthday | Message `Coupon code applied successfully.` |
| 2 | Read discount row | | Label `Coupon: happybirthday`, amount `-2.50€` (5% advertised; actual -5.00€, BUG-PC-01) |
| 3 | Read totals | | Subtotal 50.00€, VAT 9.50€, Total 57.00€ (actual VAT 9.00€, Total 54.00€, BUG-PC-01) |

## TC-PC-04: Invalid coupon shows an error
- Covers: AC1d
- Priority: High
- Verdict: automate-web
- Preconditions: Cart contains Falcon 9 x1
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Apply coupon | invalidcoupon | Error `Coupon "invalidcoupon" does not exist!` |
| 2 | Read totals | | Unchanged: Total 60.00€, no discount row |

## TC-PC-05: Empty coupon shows an error
- Covers: AC1e
- Priority: High
- Verdict: automate-web
- Preconditions: Cart contains Falcon 9 x1
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Click Apply coupon with the field empty | | Error `Please enter a coupon code.` |
| 2 | Read totals | | Unchanged: Total 60.00€ |

## TC-PC-06: Applying the same coupon twice shows "already applied"
- Covers: AC1f
- Priority: High
- Verdict: automate-web
- Preconditions: Cart contains Falcon 9 x1, `happybirthday` already applied
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Apply coupon again | happybirthday | Error `Coupon code already applied!` |
| 2 | Read totals | | Unchanged from the applied state (one discount row, Total 54.00€) |

## TC-PC-07: Removing the coupon restores the original totals
- Covers: AC1g
- Priority: High
- Verdict: automate-web
- Preconditions: Cart contains Falcon 9 x1, `happybirthday` applied. Assert the restored total equals the total captured before applying (60.00€), not a hard-coded discount.
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Click `[Remove]` on the coupon row | | Message `Coupon has been removed.`, discount row gone |
| 2 | Read totals | | Subtotal 50.00€, VAT 10.00€, Total 60.00€ (same as before applying) |

## Coverage
| AC | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|---|---|---|---|---|---|---|---|
| AC1a page and button | x | | | | | | |
| AC1b alert | | x | | | | | |
| AC1c apply, discount, total | | | x | | | | |
| AC1d invalid | | | | x | | | |
| AC1e empty | | | | | x | | |
| AC1f already applied | | | | | | x | |
| AC1g remove restores total | | | | | | | x |
