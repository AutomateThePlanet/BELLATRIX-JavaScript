import { WebPageAsserts } from '@bellatrix/web/pages'
import { CheckoutPageMap } from './CheckoutPageMap';

export class CheckoutPageAsserts extends WebPageAsserts<CheckoutPageMap> {
    async orderReceived() {
        await this.map.receivedMessage.validate('innerText').is('Order received');
    }
}