import { WebPageAsserts } from '@bellatrix/web/pages';
import { Validator } from '@bellatrix/web/validators';
import { CartPageMap } from './CartPageMap';

export class CartPageAsserts extends WebPageAsserts<CartPageMap> {
    async couponAppliedSuccessfully() {
        await this.map.messageAlert.validate('innerText').is('Coupon code applied successfully.');
    }

    async totalPrice(expectedPrice: string) {
        await this.map.totalSpan.validate('innerText').is(`${expectedPrice}€`);
    }

    async couponDoesNotExist(code: string) {
        await this.map.errorNotice.validate('innerText').is(`Coupon "${code}" does not exist!`);
    }

    async couponCodeRequired() {
        await this.map.errorNotice.validate('innerText').is('Please enter a coupon code.');
    }

    async couponAlreadyApplied() {
        await this.map.errorNotice.validate('innerText').is('Coupon code already applied!');
    }

    async couponRemovedSuccessfully() {
        await this.map.messageAlert.validate('innerText').is('Coupon has been removed.');
    }

    async couponDiscountLabelIs(code: string, expected: string) {
        await this.map.getCouponDiscountLabelByCode(code).validate('innerText').is(expected);
    }

    // The cell text is "-<amount> [Remove]". The " [Remove]" suffix is stripped so the amount
    // can be compared exactly with is().
    async couponDiscountIs(code: string, expected: string) {
        await new Validator(async () => {
            const text = await this.map.getCouponDiscountCellByCode(code).getInnerText();
            return text.replace(/\s*\[Remove\]\s*$/, '');
        }, `coupon ${code} discount`).is(expected);
    }

    async subtotalIs(expected: string) {
        await this.map.subtotalSpan.validate('innerText').is(`${expected}€`);
    }

    async vatIs(expected: string) {
        await this.map.vatSpan.validate('innerText').is(`${expected}€`);
    }

    async totalIs(expected: string) {
        await this.map.totalSpan.validate('innerText').is(expected);
    }

    async couponDiscountRowCountIs(expected: number) {
        await new Validator(async () => {
            let visible = 0;
            for (const row of await this.map.couponDiscountRows.get()) {
                if (await row.isVisible()) {
                    visible++;
                }
            }

            return visible;
        }, 'visible coupon discount rows').equals(expected);
    }
}
