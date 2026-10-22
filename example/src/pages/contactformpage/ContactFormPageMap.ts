import { Button, CheckBox, EmailField, Label, RadioButton, TextArea, TextField } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';
import { OvernightStayOption, PriceTier, RequiredField, Session } from './ContactFormInfo';

export class ContactFormPageMap extends WebPageMap {
    private readonly errorLabelIds: Record<RequiredField, string> = {
        firstName: 'wpforms-3347-field_1-error',
        lastName: 'wpforms-3347-field_1-last-error',
        email: 'wpforms-3347-field_2-error',
        priceTier: 'wpforms[fields][3]-error',
        sessions: 'wpforms[fields][4][]-error',
        overnightStay: 'wpforms[fields][5]-error',
    };

    get firstNameField() {
        return this.create(TextField).byId('wpforms-3347-field_1');
    }

    get lastNameField() {
        return this.create(TextField).byId('wpforms-3347-field_1-last');
    }

    get emailField() {
        return this.create(EmailField).byId('wpforms-3347-field_2');
    }

    getPriceTierRadio(tier: PriceTier) {
        return this.create(RadioButton).byCss(`input[name="wpforms[fields][3]"][value="${tier}"]`);
    }

    getSessionCheckBox(session: Session) {
        return this.create(CheckBox).byCss(`input[name="wpforms[fields][4][]"][value="${session}"]`);
    }

    getOvernightStayRadio(option: OvernightStayOption) {
        return this.create(RadioButton).byCss(`input[name="wpforms[fields][5]"][value="${option}"]`);
    }

    get emailUpdatesCheckBox() {
        return this.create(CheckBox).byName('wpforms[fields][6][]');
    }

    get commentsTextArea() {
        return this.create(TextArea).byId('wpforms-3347-field_7');
    }

    get submitButton() {
        return this.create(Button).byId('wpforms-submit-3347');
    }

    getErrorLabel(field: RequiredField) {
        return this.create(Label).byAttribute('id', this.errorLabelIds[field]);
    }

    // List variants: the error label is hidden or removed once a field is valid, and a single-element
    // finder waits for it to be visible and throws, so absence can only be checked through a list.
    getErrorLabels(field: RequiredField) {
        return this.create(Label).allByAttribute('id', this.errorLabelIds[field]);
    }

    get emailUpdatesErrorLabels() {
        return this.create(Label).allByCss('#wpforms-3347-field_6-container label.wpforms-error');
    }
}
