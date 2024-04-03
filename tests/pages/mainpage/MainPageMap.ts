import { Button, Anchor } from '@bellatrix/web/components';
import { WebPageMap } from '@bellatrix/web/pages';

export class MainPageMap extends WebPageMap {
    get addToCartFalcon9() {
        return this.components.createByCss(Anchor, '[data-product_id*="28"]');
    }

    get viewCartButton() {
        return this.components.createByCss(Button, '[class*="added_to_cart wc-forward"]');
    }

    getProductBoxByName(name: string) {
        return this.components.createByXpath(Anchor, `//h2[text()="${name}"]/parent::a[1]`);
    }

    getProductAddToCartButtonByName(name: string) {
        return this.components.createByXpath(Button, `//h2[text()="${name}"]/parent::a[1]/following-sibling::a[1]`);
    }
}