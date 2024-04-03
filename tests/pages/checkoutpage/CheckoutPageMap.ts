import { Button, CheckBox, Heading, RadioButton, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class CheckoutPageMap extends WebPageMap {
    get billingFirstName() {
        return this.components.createById(TextField, 'billing_first_name');
    }

    get billingLastName() {
        return this.components.createById(TextField, 'billing_last_name');
    }

    get billingCompany() {
        return this.components.createById(TextField, 'billing_company');
    }

    get billingCountryWrapper() {
        return this.components.createById(Button, 'select2-billing_country-container');
    }

    get billingCountryFilter() {
        return this.components.createByClass(TextField, 'select2-search__field');
    }

    get billingAddress1() {
        return this.components.createById(TextField, 'billing_address_1');
    }

    get billingAddress2() {
        return this.components.createById(TextField, 'billing_address_2');
    }

    get billingCity() {
        return this.components.createById(TextField, 'billing_city');
    }

    get billingZip() {
        return this.components.createById(TextField, 'billing_postcode');
    }

    get billingPhone() {
        return this.components.createById(TextField, 'billing_phone');
    }

    get billingEmail() {
        return this.components.createById(TextField, 'billing_email');
    }

    get createAccountCheckBox() {
        return this.components.createById(CheckBox, 'createaccount');
    }

    get checkPaymentsRadioButton() {
        return this.components.createByCss(RadioButton, '[for*="payment_method_cheque"]');
    }

    get placeOrderButton() {
        return this.components.createById(Button, 'place_order');
    }

    get receivedMessage() {
        return this.components.createByXpath(Heading, '//h1');
    }

    getCountryOptionByName(countryName: string) {
        return this.components.createByXpath(Button, `//li[contains(text(),'${countryName}')]`);
    }
}