import { WebPageAsserts } from '@bellatrix/web/pages'
import { CartPageMap } from './CartPageMap';

export class CartPageAsserts extends WebPageAsserts<CartPageMap> {
    async couponAppliedSuccessfully() {
        await this.map.messageAlert.validate('innerText').is('Coupon code applied successfully.');
    }

    async totalPrice(expectedPrice: string) {
        await this.map.totalSpan.validate('innerText').is(expectedPrice);
    }
}