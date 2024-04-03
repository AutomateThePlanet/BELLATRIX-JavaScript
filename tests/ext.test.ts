import { PluginExecutionEngine } from "@bellatrix/core/infrastructure";
import { WebTest } from "@bellatrix/web/infrastructure";
import { Test, TestClass, describe, test } from "@bellatrix/web/test";
import { BrowserWorkflowPlugin } from "./base";
import { Button } from "@bellatrix/web/components";
import { CheckoutPage } from "./pages/checkoutpage/CheckoutPage";
import { MainPage } from "./pages/mainpage/MainPage";
import { CartPage } from "./pages/cartpage/CartPage";
import { PurchaseInfo } from "./pages/checkoutpage/PurchaseInfo";

@TestClass
class ProductPurchaseTests extends WebTest {
    override async configure() {
        PluginExecutionEngine.addPlugin(BrowserWorkflowPlugin);
    }

    override async afterEach() {
        await this.app.cookies.clearCookies();
    }

    @Test
    async completePurchaseSuccessfully_first() {
        await this.app.navigation.navigate('https://demos.bellatrix.solutions/');
        const addToCartFalcon9 = this.app.components.createByCss(Button, '[data-product_id*="28"]');
        const blogLink = this.app.components.createByInnerTextContaining(Button, 'Blog');
        await addToCartFalcon9.click();
        // blogLink.above(addToCartFalcon9).validate(); // layout assert
        await new MainPage().asserts.productBoxLink('Falcon 9', 'https://demos.bellatrix.solutions/product/falcon-9/');
    }

    @Test
    async completePurchaseSuccessfully_second() {
        await this.app.navigation.navigate('https://demos.bellatrix.solutions/');
        const addToCartFalcon9 = this.app.components.createByCss(Button, "[data-product_id*='28']");
        await addToCartFalcon9.click();
    }

    @Test
    async falcon9LinkAddsCorrectProduct() {
        const mainPage = await this.app.goTo(MainPage);

        await mainPage.asserts.productBoxLink("Falcon 9", "https://demos.bellatrix.solutions/product/falcon-9/");
    }

    @Test
    async saturnVLinkAddsCorrectProduct() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.asserts.productBoxLink("Saturn V", "https://demos.bellatrix.solutions/product/saturn-v/");
    }

    @Test
    async purchaseFalcon9WithoutFacade() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.addRocketToShoppingCart("Falcon 9");

        const cartPage = this.app.create(CartPage);
        await cartPage.applyCoupon("happybirthday");
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.increaseProductQuantity(2);
        await cartPage.asserts.totalPrice("114.00€");
        await cartPage.clickProceedToCheckout();

        const purchaseInfo = {
            email: "info@berlinspaceflowers.com",
            firstName: "Anton",
            lastName: "Angelov",
            company: "Space Flowers",
            country: "Germany",
            address1: "1 Willi Brandt Avenue Tiergarten",
            address2: "Lützowplatz 17",
            city: "Berlin",
            zip: "10115",
            phone: "+498888999281",
        };

        const checkoutPage = this.app.create(CheckoutPage);
        await checkoutPage.fillBillingInfo(purchaseInfo);
        await checkoutPage.asserts.orderReceived();
    }

    @Test
    async purchaseSaturnVWithoutFacade() {
        const mainPage = await this.app.goTo(MainPage);
        await mainPage.addRocketToShoppingCart("Saturn V");

        const cartPage = this.app.create(CartPage);
        await cartPage.applyCoupon("happybirthday");
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.increaseProductQuantity(3);
        await cartPage.asserts.totalPrice("355.00€");
        await cartPage.clickProceedToCheckout();

        const purchaseInfo: PurchaseInfo = {
            email: "info@berlinspaceflowers.com",
            firstName: "Anton",
            lastName: "Angelov",
            company: "Space Flowers",
            country: "Germany",
            address1: "1 Willi Brandt Avenue Tiergarten",
            address2: "Lützowplatz 17",
            city: "Berlin",
            zip: "10115",
            phone: "+498888999281",
        };

        const checkoutPage = this.app.create(CheckoutPage);
        await checkoutPage.fillBillingInfo(purchaseInfo);
        await checkoutPage.asserts.orderReceived();
    }
}