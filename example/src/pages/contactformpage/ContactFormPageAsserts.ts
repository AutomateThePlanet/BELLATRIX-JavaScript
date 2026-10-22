import { resolve } from '@bellatrix/core/utilities';
import { ComponentsList, Label } from '@bellatrix/web/components';
import { App } from '@bellatrix/web/infrastructure';
import { WebPageAsserts } from '@bellatrix/web/pages';
import { Validator } from '@bellatrix/web/validators';
import { ContactFormPageMap } from './ContactFormPageMap';
import { ContactFormInfo, OvernightStayOption, OvernightStayOptions, PriceTier, PriceTiers, RequiredField, Session, Sessions } from './ContactFormInfo';

export class ContactFormPageAsserts extends WebPageAsserts<ContactFormPageMap> {
    private readonly requiredMessage = 'This field is required.';
    private readonly invalidEmailMessage = 'Please enter a valid email address.';

    async requiredErrorShown(field: RequiredField) {
        await this.map.getErrorLabel(field).validate('innerText').is(this.requiredMessage);
    }

    async invalidEmailErrorShown() {
        await this.map.getErrorLabel('email').validate('innerText').is(this.invalidEmailMessage);
    }

    async noErrorShown(field: RequiredField) {
        await this.noVisibleLabels(() => this.map.getErrorLabels(field), `${field} error labels visible`);
    }

    async emailUpdatesHasNoError() {
        await this.noVisibleLabels(() => this.map.emailUpdatesErrorLabels, 'email updates error labels visible');
    }

    async formStillDisplayed() {
        await this.map.submitButton.validateIs('visible');
        await this.map.firstNameField.validateIs('visible');
    }

    async urlUnchanged(expectedUrl: string) {
        await new Validator(() => resolve(App).browser.getUrl(), 'page URL').is(expectedUrl);
    }

    async priceTierSelected(tier: PriceTier) {
        for (const option of PriceTiers) {
            if (option === tier) {
                await this.map.getPriceTierRadio(option).validateIs('checked');
            } else {
                await this.map.getPriceTierRadio(option).validateIsNot('checked');
            }
        }
    }

    async overnightStaySelected(selected: OvernightStayOption) {
        for (const option of OvernightStayOptions) {
            if (option === selected) {
                await this.map.getOvernightStayRadio(option).validateIs('checked');
            } else {
                await this.map.getOvernightStayRadio(option).validateIsNot('checked');
            }
        }
    }

    async sessionsChecked(expected: Session[]) {
        for (const session of Sessions) {
            if (expected.includes(session)) {
                await this.map.getSessionCheckBox(session).validateIs('checked');
            } else {
                await this.map.getSessionCheckBox(session).validateIsNot('checked');
            }
        }
    }

    async emailUpdatesChecked(expected: boolean) {
        if (expected) {
            await this.map.emailUpdatesCheckBox.validateIs('checked');
        } else {
            await this.map.emailUpdatesCheckBox.validateIsNot('checked');
        }
    }

    async fieldValues(info: Pick<ContactFormInfo, 'firstName' | 'lastName' | 'email' | 'comments'>) {
        if (info.firstName !== undefined) {
            await this.map.firstNameField.validate('value').is(info.firstName);
        }

        if (info.lastName !== undefined) {
            await this.map.lastNameField.validate('value').is(info.lastName);
        }

        if (info.email !== undefined) {
            await this.map.emailField.validate('value').is(info.email);
        }

        if (info.comments !== undefined) {
            await this.map.commentsTextArea.validate('value').is(info.comments);
        }
    }

    private async noVisibleLabels(createLabels: () => ComponentsList<Label>, description: string) {
        await new Validator(async () => {
            let visible = 0;
            for (const label of await createLabels().get()) {
                if (await label.isVisible()) {
                    visible++;
                }
            }

            return visible;
        }, description).equals(0);
    }
}
