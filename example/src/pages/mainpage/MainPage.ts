import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { MainPageMap } from './MainPageMap';
import { MainPageAsserts } from './MainPageAsserts';

@Page(MainPageMap, MainPageAsserts)
export class MainPage extends WebPage<MainPageMap, MainPageAsserts> {
    protected override get url() {
        return 'https://demos.bellatrix.solutions/';
    }

    protected override async waitForPageLoad() {
        await this.map.addToCartFalcon9.wait.toExist();
    }

    async addRocketToShoppingCart(rocketName: string) {
        await this.open();
        await this.map.getProductAddToCartButtonByName(rocketName).click();
        await this.map.viewCartButton.click();
    }
}