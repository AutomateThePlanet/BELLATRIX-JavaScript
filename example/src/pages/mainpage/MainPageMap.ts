import { Button, Anchor } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class MainPageMap extends WebPageMap {
    get addToCartFalcon9() {
        return this.create(Anchor).byCss('[data-product_id*="28"]');
    }

    get viewCartButton() {
        return this.create(Button).byCss('[class*="added_to_cart wc-forward"]');
    }

    getProductBoxByName(name: string) {
        return this.create(Anchor).byXpath(`//h2[text()="${name}"]/parent::a[1]`);
    }

    getProductAddToCartButtonByName(name: string) {
        return this.create(Button).byXpath(`//h2[text()="${name}"]/parent::a[1]/following-sibling::a[1]`);
    }
}
