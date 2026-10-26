import { resolve } from '@bellatrix/core/utilities';
import { App } from '@bellatrix/web/infrastructure';
import { WebPageAsserts } from '@bellatrix/web/pages';
import { Validator } from '@bellatrix/web/validators';
import { PromotionsPageMap } from './PromotionsPageMap';

export class PromotionsPageAsserts extends WebPageAsserts<PromotionsPageMap> {
    async pageTitleIs(expected: string) {
        await new Validator(() => resolve(App).browser.getTitle(), 'page title').is(expected);
    }

    async headingIs(expected: string) {
        await this.map.heading.validate('innerText').is(expected);
    }

    async couponButtonShown(expectedText: string) {
        await this.map.couponButton.validateIs('visible');
        await this.map.couponButton.validate('innerText').is(expectedText);
    }

    // The message must never make the lambda throw: a throwing condition makes waitUntil retry
    // without sleeping and starves the event loop (see "Known framework gaps").
    async couponAlertMessageIs(expected: string) {
        await new Validator(() => resolve(App).dialog.getMessage().catch(() => ''), 'coupon alert message').is(expected);
    }

    async stillOnPromotionsPage() {
        await new Validator(() => resolve(App).browser.getUrl(), 'page URL').contains('/welcome/');
        await this.map.couponButton.validateIs('visible');
    }

    async headerCartCountIs(expected: string) {
        await this.map.headerCartCount.validate('innerText').is(expected);
    }
}
