import { Button, CheckBox, Heading, RadioButton, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class CheckoutPageMap extends WebPageMap {
    get billingFirstName() {
        return this.create(TextField).byId('billing_first_name');
    }

    get billingLastName() {
        return this.create(TextField).byId('billing_last_name');
    }

    get billingCompany() {
        return this.create(TextField).byId('billing_company');
    }

    get billingCountryWrapper() {
        return this.create(Button).byId('select2-billing_country-container');
    }

    get billingCountryFilter() {
        return this.create(TextField).byClass('select2-search__field');
    }

    get billingAddress1() {
        return this.create(TextField).byId('billing_address_1');
    }

    get billingAddress2() {
        return this.create(TextField).byId('billing_address_2');
    }

    get billingCity() {
        return this.create(TextField).byId('billing_city');
    }

    get billingZip() {
        return this.create(TextField).byId('billing_postcode');
    }

    get billingPhone() {
        return this.create(TextField).byId('billing_phone');
    }

    get billingEmail() {
        return this.create(TextField).byId('billing_email');
    }

    get createAccountCheckBox() {
        return this.create(CheckBox).byId('createaccount');
    }

    get checkPaymentsRadioButton() {
        return this.create(RadioButton).byCss('[for*="payment_method_cheque"]');
    }

    get placeOrderButton() {
        return this.create(Button).byId('place_order');
    }

    get receivedMessage() {
        return this.create(Heading).byXpath('//h1');
    }

    getCountryOptionByName(countryName: string) {
        return this.create(Button).byXpath(`//li[contains(text(),'${countryName}')]`);
    }
}
