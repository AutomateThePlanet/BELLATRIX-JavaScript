import { resolve } from '@bellatrix/core/utilities';
import { App } from '@bellatrix/web/infrastructure';
import { WebPageAsserts } from '@bellatrix/web/pages';
import { Validator } from '@bellatrix/web/validators';
import { PromotionsPageMap } from './PromotionsPageMap';

export class PromotionsPageAsserts extends WebPageAsserts<PromotionsPageMap> {
    async headingIs(expected: string) {
        await this.map.heading.validate('innerText').is(expected);
    }

    async couponButtonShown(expectedText: string) {
        await this.map.couponButton.validateIs('visible');
        await this.map.couponButton.validate('innerText').is(expectedText);
    }

    // Polls until the dialog opened by openCouponAlert() is captured. getMessage() throws while there is no
    // dialog; that is mapped to '' so the Validator sleeps between polls (a throwing condition is retried in a
    // tight loop that starves the event loop, so the pending click never gets to open the alert).
    async couponAlertMessageIs(expected: string) {
        let lastMessage = '';
        await new Validator(async () => {
            try {
                lastMessage = await resolve(App).dialog.getMessage();
            } catch {
                // no dialog yet (or already dismissed): keep reporting the last message seen
            }

            return lastMessage;
        }, 'alert message').is(expected);
    }
}
