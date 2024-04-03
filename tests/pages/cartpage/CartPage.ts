import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { CartPageMap } from './CartPageMap';
import { CartPageAsserts } from './CartPageAsserts';

@Page(CartPageMap, CartPageAsserts)
export class CartPage extends WebPage<CartPageMap, CartPageAsserts> {
    protected override get url() {
        return 'https://demos.bellatrix.solutions/cart/';
    }

    protected override async waitForPageLoad() {
        // await this.map.couponCodeTextField.validateIsNot('disabled'); // TODO: BE VISIBLE???
    }

    async applyCoupon(coupon: string) {
        await this.map.couponCodeTextField.setText(coupon);
        await this.map.applyCouponButton.click();
        await this.app.browser.waitForAjax();
    }

    async increaseProductQuantity(newQuantity: number) {
        await this.map.quantityBox.setText(newQuantity.toString());
        await this.map.updateCart.click();
        await this.app.browser.waitForAjax();
    }

    async clickProceedToCheckout() {
        await this.map.proceedToCheckout.click();
        await this.app.browser.waitUntilPageLoadsCompletely(); // TODO: implement
    }

    async getTotal() {
        return await this.map.totalSpan.getInnerText();
    }

    async getMessageNotification() {
        return await this.map.messageAlert.getInnerText();
    }
}