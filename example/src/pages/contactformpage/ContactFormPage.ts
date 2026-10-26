import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { ContactFormPageMap } from './ContactFormPageMap';
import { ContactFormPageAsserts } from './ContactFormPageAsserts';
import { ContactFormInfo, Session } from './ContactFormInfo';

@Page(ContactFormPageMap, ContactFormPageAsserts)
export class ContactFormPage extends WebPage<ContactFormPageMap, ContactFormPageAsserts> {
    protected override get url() {
        return 'https://demos.bellatrix.solutions/contact-form/';
    }

    protected override async waitForPageLoad() {
        await this.map.submitButton.wait.toExist();
    }

    async fillForm(info: ContactFormInfo) {
        if (info.firstName !== undefined) {
            await this.map.firstNameField.setText(info.firstName);
        }

        if (info.lastName !== undefined) {
            await this.map.lastNameField.setText(info.lastName);
        }

        if (info.email !== undefined) {
            await this.map.emailField.setEmail(info.email);
        }

        if (info.priceTier !== undefined) {
            await this.map.getPriceTierRadio(info.priceTier).click();
        }

        for (const session of info.sessions ?? []) {
            await this.map.getSessionCheckBox(session).check();
        }

        if (info.overnightStay !== undefined) {
            await this.map.getOvernightStayRadio(info.overnightStay).click();
        }

        if (info.receiveEmailUpdates === true) {
            await this.map.emailUpdatesCheckBox.check();
        } else if (info.receiveEmailUpdates === false) {
            await this.map.emailUpdatesCheckBox.uncheck();
        }

        if (info.comments !== undefined) {
            await this.map.commentsTextArea.setText(info.comments);
        }

        // Move focus away so the last text field blurs and client-side validation runs.
        await this.map.commentsTextArea.focus();
    }

    async uncheckSession(session: Session) {
        await this.map.getSessionCheckBox(session).uncheck();
    }

    async submitExpectingValidationErrors() {
        const firstName = await this.map.firstNameField.getValue();
        const lastName = await this.map.lastNameField.getValue();

        if (firstName.trim() !== '' && lastName.trim() !== '') {
            throw new Error('Safety rule (journal 2026-10-22-contact-form-automation): first or last name must be empty before Submit');
        }

        await this.map.submitButton.click();
    }
}
