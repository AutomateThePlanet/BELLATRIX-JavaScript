import { Anchor, Button, Div, Span, TextField } from '@bellatrix/web/components';
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

    get errorNotice() {
        return this.create(Div).byCss('ul.woocommerce-error li');
    }

    get subtotalSpan() {
        return this.create(Span).byCss('tr.cart-subtotal .woocommerce-Price-amount');
    }

    get vatSpan() {
        return this.create(Span).byCss('tr.tax-total .woocommerce-Price-amount');
    }

    get couponDiscountRows() {
        return this.create(Div).allByCss('tr.cart-discount');
    }

    getCouponDiscountLabelByCode(code: string) {
        return this.create(Div).byCss(`tr.coupon-${code} th`);
    }

    getCouponDiscountCellByCode(code: string) {
        return this.create(Div).byCss(`tr.coupon-${code} td`);
    }

    getRemoveCouponLinkByCode(code: string) {
        return this.create(Anchor).byCss(`a.woocommerce-remove-coupon[data-coupon="${code}"]`);
    }
}
