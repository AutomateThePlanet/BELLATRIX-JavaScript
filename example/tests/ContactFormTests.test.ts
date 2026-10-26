import { Test, TestClass } from '@bellatrix/web/test';
import { Category, TestCase } from '@bellatrix/core/decorators';
import { WebTest } from '@bellatrix/web/infrastructure';
import { ExtraWebHooks } from '@bellatrix/extras-web/hooks';
import { LogLifecyclePlugin, ScreenshotOnFailPlugin } from '@bellatrix/extras-web/plugins';
import { addPlugin } from '@bellatrix/core/infrastructure';

import { Categories } from '../src/Categories';
import { ContactFormPage, PriceTier, PriceTiers, RequiredField, RequiredFields } from '../src/pages';

@TestClass
@Category(Categories.ContactForm)
export class ContactFormTests extends WebTest {
    override async configure(): Promise<void> {
        await super.configure();
        ExtraWebHooks.addComponentBDDLogging();
        addPlugin(LogLifecyclePlugin);
        addPlugin(ScreenshotOnFailPlugin);
    }

    override async afterEach() {
        await this.app.cookies.clearCookies();
    }

    @Test
    async requiredErrorsShown_when_emptyFormSubmitted() { // TC: TC-CF-01
        const contactFormPage = await this.app.goTo(ContactFormPage);
        const urlBeforeSubmit = await this.app.browser.getUrl();

        await contactFormPage.submitExpectingValidationErrors();

        await contactFormPage.asserts.formStillDisplayed();
        await contactFormPage.asserts.urlUnchanged(urlBeforeSubmit);
        for (const field of RequiredFields) {
            await contactFormPage.asserts.requiredErrorShown(field);
        }
    }

    @TestCase('firstName')
    @TestCase('lastName')
    async onlyMissingNameShowsError_when_otherFieldsFilled(missing: 'firstName' | 'lastName') { // TC: TC-CF-02
        const contactFormPage = await this.app.goTo(ContactFormPage);
        await contactFormPage.fillForm({
            firstName: missing === 'firstName' ? undefined : 'John',
            lastName: missing === 'lastName' ? undefined : 'Smith',
            email: 'user@example.com',
            priceTier: 'Silver - $299.95',
            sessions: ['Session 1'],
            overnightStay: 'No',
        });

        await contactFormPage.submitExpectingValidationErrors();

        await contactFormPage.asserts.requiredErrorShown(missing);
        const others: RequiredField[] = RequiredFields.filter(field => field !== missing);
        for (const field of others) {
            await contactFormPage.asserts.noErrorShown(field);
        }
    }

    @Test
    async requiredErrorsDisappear_when_fieldsFilled() { // TC: TC-CF-03
        const contactFormPage = await this.app.goTo(ContactFormPage);
        await contactFormPage.submitExpectingValidationErrors();
        for (const field of RequiredFields) {
            await contactFormPage.asserts.requiredErrorShown(field);
        }

        await contactFormPage.fillForm({ priceTier: 'Silver - $299.95' });
        await contactFormPage.asserts.noErrorShown('priceTier');
        for (const field of RequiredFields.filter(f => f !== 'priceTier')) {
            await contactFormPage.asserts.requiredErrorShown(field);
        }

        await contactFormPage.fillForm({ sessions: ['Session 1'] });
        await contactFormPage.asserts.noErrorShown('sessions');

        await contactFormPage.fillForm({ overnightStay: 'No' });
        await contactFormPage.asserts.noErrorShown('overnightStay');

        await contactFormPage.fillForm({ lastName: 'Smith' });
        await contactFormPage.asserts.noErrorShown('lastName');

        await contactFormPage.fillForm({ email: 'user@example.com' });
        await contactFormPage.asserts.noErrorShown('email');

        await contactFormPage.asserts.requiredErrorShown('firstName');
    }

    @TestCase('abc')
    @TestCase('abc@')
    @TestCase('user@domain')
    async invalidEmailErrorShown_when_emailFormatInvalid(email: string) { // TC: TC-CF-04
        const contactFormPage = await this.app.goTo(ContactFormPage);
        await contactFormPage.fillForm({ email });

        await contactFormPage.submitExpectingValidationErrors();

        await contactFormPage.asserts.invalidEmailErrorShown();
    }

    @Test
    async emailErrorCleared_when_validEmailSubmitted() { // TC: TC-CF-04
        const contactFormPage = await this.app.goTo(ContactFormPage);
        await contactFormPage.fillForm({ email: 'abc' });
        await contactFormPage.submitExpectingValidationErrors();
        await contactFormPage.asserts.invalidEmailErrorShown();

        await contactFormPage.fillForm({ email: 'user@example.com' });
        await contactFormPage.submitExpectingValidationErrors();

        await contactFormPage.asserts.requiredErrorShown('firstName');
        await contactFormPage.asserts.noErrorShown('email');
    }

    @Test
    async textFieldsKeepEnteredValues_when_typed() { // TC: TC-CF-06
        const contactFormPage = await this.app.goTo(ContactFormPage);
        const info = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            comments: 'Hello, this is a test.',
        };

        await contactFormPage.fillForm(info);

        await contactFormPage.asserts.fieldValues(info);
    }

    @TestCase(PriceTiers[0])
    @TestCase(PriceTiers[1])
    @TestCase(PriceTiers[2])
    async onlySelectedPriceTierChecked_when_tierSelected(tier: PriceTier) { // TC: TC-CF-07
        const contactFormPage = await this.app.goTo(ContactFormPage);

        await contactFormPage.fillForm({ priceTier: tier });

        await contactFormPage.asserts.priceTierSelected(tier);
    }

    @Test
    async onlySelectedOvernightOptionChecked_when_switched() { // TC: TC-CF-08
        const contactFormPage = await this.app.goTo(ContactFormPage);

        await contactFormPage.fillForm({ overnightStay: 'Yes' });
        await contactFormPage.asserts.overnightStaySelected('Yes');

        await contactFormPage.fillForm({ overnightStay: 'No' });
        await contactFormPage.asserts.overnightStaySelected('No');
    }

    @Test
    async onlyUncheckedSessionCleared_when_oneOfSeveralUnchecked() { // TC: TC-CF-09
        const contactFormPage = await this.app.goTo(ContactFormPage);

        await contactFormPage.fillForm({ sessions: ['Session 1', 'Session 3', 'Session 5'] });
        await contactFormPage.asserts.sessionsChecked(['Session 1', 'Session 3', 'Session 5']);

        await contactFormPage.uncheckSession('Session 3');
        await contactFormPage.asserts.sessionsChecked(['Session 1', 'Session 5']);
    }

    @Test
    async emailUpdatesCheckBoxToggles_when_checkedAndUnchecked() { // TC: TC-CF-10
        const contactFormPage = await this.app.goTo(ContactFormPage);

        await contactFormPage.fillForm({ receiveEmailUpdates: true });
        await contactFormPage.asserts.emailUpdatesChecked(true);

        await contactFormPage.fillForm({ receiveEmailUpdates: false });
        await contactFormPage.asserts.emailUpdatesChecked(false);
    }

    @Test
    async noErrorForEmailUpdates_when_emptyFormSubmitted() { // TC: TC-CF-10
        const contactFormPage = await this.app.goTo(ContactFormPage);

        await contactFormPage.submitExpectingValidationErrors();

        await contactFormPage.asserts.requiredErrorShown('firstName');
        await contactFormPage.asserts.emailUpdatesHasNoError();
    }
}
