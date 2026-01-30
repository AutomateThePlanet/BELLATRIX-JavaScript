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
        await this.map.couponCodeTextField.wait.toExist();
    }

    async applyCoupon(coupon: string) {
        await this.map.couponCodeTextField.setText(coupon);
        await this.map.applyCouponButton.click();
        await this.app.browser.waitForAjax();
    }

    async increaseProductQuantity(productNumber: number, newQuantity: number) {
        if (productNumber > await this.map.quantityBoxes.count()) {
            throw new Error('There are less added items in the cart. Please specify smaller product number.');
        }

        await this.app.browser.waitForAjax();
        const quantityBox = await this.map.quantityBoxes.get(productNumber - 1);

        await quantityBox.setText(newQuantity.toString());
        await this.map.updateCart.click();
        await this.app.browser.waitForAjax();
    }

    async clickProceedToCheckout() {
        await this.map.proceedToCheckout.click();
        await this.app.browser.waitUntilPageLoadsCompletely();
    }

    async getTotal() {
        return await this.map.totalSpan.getInnerText();
    }

    async getMessageNotification() {
        return await this.map.messageAlert.getInnerText();
    }
}
