import { Button, Div, Span, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class CartPageMap extends WebPageMap {
    get couponCodeTextField() {
        return this.components.createById(TextField, 'coupon_code');
    }

    get applyCouponButton() {
        return this.components.createByCss(Button, '[value*="Apply coupon"]');
    }

    get quantityBox() {
        return this.components.createByCss(TextField, '[class*="input-text qty text"]');
    }

    get updateCart() {
        return this.components.createByCss(Button, '[value*="Update cart"]');
    }

    get messageAlert() {
        return this.components.createByCss(Div, '[class*="woocommerce-message"]');
    }

    get totalSpan() {
        return this.components.createByXpath(Span, '//*[@class="order-total"]//span');
    }

    get proceedToCheckout() {
        return this.components.createByCss(Button, '[class*="checkout-button button alt wc-forward"]');
    }
}