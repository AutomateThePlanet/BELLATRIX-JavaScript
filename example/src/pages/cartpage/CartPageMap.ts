import { Button, Div, Span, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class CartPageMap extends WebPageMap {
    get couponCodeTextField() {
        return this.create(TextField).byId('coupon_code');
    }

    get applyCouponButton() {
        return this.create(Button).byCss('[value*="Apply coupon"]');
    }

    get quantityBoxes() {
        return this.create(TextField).allByClassContaining('input-text qty text');
    }

    get updateCart() {
        return this.create(Button).byCss('[value*="Update cart"]');
    }

    get messageAlert() {
        return this.create(Div).byCss('[class*="woocommerce-message"]');
    }

    get totalSpan() {
        return this.create(Span).byXpath('//*[@class="order-total"]//span');
    }

    get proceedToCheckout() {
        return this.create(Button).byCss('[class*="checkout-button button alt wc-forward"]');
    }
}