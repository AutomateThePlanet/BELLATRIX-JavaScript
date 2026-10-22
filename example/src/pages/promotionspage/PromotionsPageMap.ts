import { Button, Heading } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class PromotionsPageMap extends WebPageMap {
    get heading() {
        return this.create(Heading).byCss('h1.entry-title');
    }

    get couponButton() {
        return this.create(Button).byId('couponBtn');
    }
}
