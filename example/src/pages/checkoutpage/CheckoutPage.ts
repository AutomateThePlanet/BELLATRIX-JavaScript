import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { CheckoutPageMap } from './CheckoutPageMap';
import { CheckoutPageAsserts } from './CheckoutPageAsserts';
import { PurchaseInfo } from './PurchaseInfo';

@Page(CheckoutPageMap, CheckoutPageAsserts)
export class CheckoutPage extends WebPage<CheckoutPageMap, CheckoutPageAsserts> {
    protected override get url() {
        return 'https://demos.bellatrix.solutions/checkout/';
    }

    async fillBillingInfo(purchaseInfo: PurchaseInfo) {
        await this.map.billingFirstName.setText(purchaseInfo.firstName);
        await this.map.billingLastName.setText(purchaseInfo.lastName);
        await this.map.billingCompany.setText(purchaseInfo.company);
        await this.map.billingCountryWrapper.click();
        await this.map.billingCountryFilter.setText(purchaseInfo.country);
        await this.map.getCountryOptionByName(purchaseInfo.country).click();
        await this.map.billingAddress1.setText(purchaseInfo.address1);
        await this.map.billingAddress2.setText(purchaseInfo.address2);
        await this.map.billingCity.setText(purchaseInfo.city);
        await this.map.billingZip.setText(purchaseInfo.zip);
        await this.map.billingPhone.setText(purchaseInfo.phone);
        await this.map.billingEmail.setText(purchaseInfo.email);

        if (purchaseInfo.shouldCreateAccount) {
            await this.map.createAccountCheckBox.check();
        }

        if (purchaseInfo.shouldCheckPayment) {
            await this.map.checkPaymentsRadioButton.click();
        }

        await this.app.browser.waitForAjax();
        await this.map.placeOrderButton.click();
        await this.app.browser.waitForAjax();
    }
}
