import { Test, TestClass } from '@bellatrix/web/test';
import { Category } from '@bellatrix/core/decorators';
import { WebTest } from '@bellatrix/web/infrastructure';
import { Button } from '@bellatrix/web/components';
import { ExtraWebHooks } from '@bellatrix/extras/hooks';
import { LogLifecyclePlugin, ScreenshotOnFailPlugin } from '@bellatrix/extras/plugins';
import { PluginExecutionEngine } from '@bellatrix/core/infrastructure';
import { WebServiceHooks } from '@bellatrix/web/services/utilities';
import { NavigationService } from '@bellatrix/web/services';

import { Categories } from '../src/Categories';
import { MainPage, CartPage, CheckoutPage, PurchaseInfo } from '../src/pages';

@TestClass
@Category(Categories.CI)
export class ProductPurchaseTests extends WebTest {
    override async configure(): Promise<void> {
        await super.configure();
        ExtraWebHooks.addComponentBDDLogging();
        PluginExecutionEngine.addPlugin(LogLifecyclePlugin);
        PluginExecutionEngine.addPlugin(ScreenshotOnFailPlugin);
        WebServiceHooks.addListenerTo(NavigationService).before('navigate', url => console.log(`navigating to ${url}`));
    }

    override async afterEach() {
        await this.app.cookies.clearCookies();
    }

    @Test
    async completePurchaseSuccessfully_first() {
        await this.app.navigation.navigate('https://demos.bellatrix.solutions/');
        const addToCartFalcon9 = this.app.create(Button).byCss('[data-product_id*="28"]');

        await addToCartFalcon9.click();
        await new MainPage().asserts.productBoxLink('Falcon 9', 'https://demos.bellatrix.solutions/product/falcon-9/');
    }

    @Test
    async completePurchaseSuccessfully_second() {
        await this.app.navigation.navigate('https://demos.bellatrix.solutions/');
        const addToCartFalcon9 = this.app.create(Button).byCss("[data-product_id*='28']");
        await addToCartFalcon9.click();
    }

    @Test
    async falcon9LinkAddsCorrectProduct() {
        const mainPage = await this.app.goTo(MainPage);

        await mainPage.asserts.productBoxLink('Falcon 9', 'https://demos.bellatrix.solutions/product/falcon-9/');
    }

    @Test
    async saturnVLinkAddsCorrectProduct() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.asserts.productBoxLink('Saturn V', 'https://demos.bellatrix.solutions/product/saturn-v/');
    }

    @Test
    async purchaseFalcon9WithoutFacade() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.addRocketToShoppingCart('Falcon 9');

        const cartPage = this.app.createPage(CartPage);
        await cartPage.applyCoupon('happybirthday');
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.increaseProductQuantity(0, 2);
        await cartPage.asserts.totalPrice('114.00');
        await cartPage.clickProceedToCheckout();

        const purchaseInfo = {
            email: 'info@berlinspaceflowers.com',
            firstName: 'Anton',
            lastName: 'Angelov',
            company: 'Space Flowers',
            country: 'Germany',
            address1: '1 Willi Brandt Avenue Tiergarten',
            address2: 'Lützowplatz 17',
            city: 'Berlin',
            zip: '10115',
            phone: '+498888999281',
        };

        const checkoutPage = this.app.createPage(CheckoutPage);
        await checkoutPage.fillBillingInfo(purchaseInfo);
        await checkoutPage.asserts.orderReceived();
    }

    @Test
    async purchaseSaturnVWithoutFacade() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.addRocketToShoppingCart('Saturn V');

        const cartPage = this.app.createPage(CartPage);
        await cartPage.applyCoupon('happybirthday');
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.increaseProductQuantity(0, 3);
        await cartPage.asserts.totalPrice('355.00');
        await cartPage.clickProceedToCheckout();

        const purchaseInfo: PurchaseInfo = {
            email: 'info@berlinspaceflowers.com',
            firstName: 'Anton',
            lastName: 'Angelov',
            company: 'Space Flowers',
            country: 'Germany',
            address1: '1 Willi Brandt Avenue Tiergarten',
            address2: 'Lützowplatz 17',
            city: 'Berlin',
            zip: '10115',
            phone: '+498888999281',
        };

        const checkoutPage = this.app.createPage(CheckoutPage);
        await checkoutPage.fillBillingInfo(purchaseInfo);
        await checkoutPage.asserts.orderReceived();
    }
}
