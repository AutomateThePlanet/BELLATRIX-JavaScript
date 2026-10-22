import { Test, TestClass } from '@bellatrix/web/test';
import { Category, Ignore } from '@bellatrix/core/decorators';
import { WebTest } from '@bellatrix/web/infrastructure';
import { ExtraWebHooks } from '@bellatrix/extras-web/hooks';
import { LogLifecyclePlugin, ScreenshotOnFailPlugin } from '@bellatrix/extras-web/plugins';
import { addPlugin } from '@bellatrix/core/infrastructure';

import { Categories } from '../src/Categories';
import { CartPage, MainPage, PromotionsPage } from '../src/pages';

@TestClass
@Category(Categories.Coupons)
export class CouponTests extends WebTest {
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
    async couponButtonShown_when_promotionsPageOpened() { // TC: TC-PC-01
        const promotionsPage = await this.app.goTo(PromotionsPage);

        await promotionsPage.asserts.headingIs('Promotions');
        await promotionsPage.asserts.couponButtonShown('Do you want 5% off for your BD?');
    }

    @Test
    async couponAlertShown_when_couponButtonClicked() { // TC: TC-PC-02
        const promotionsPage = await this.app.goTo(PromotionsPage);

        await promotionsPage.openCouponAlert();
        await promotionsPage.asserts.couponAlertMessageIs('Try the coupon- happybirthday');
        await promotionsPage.acceptAlert();

        await promotionsPage.asserts.couponButtonShown('Do you want 5% off for your BD?');
    }

    @Ignore // BUG-PC-01: coupon applies fixed 5.00€, not 5% (journal 2026-10-23-promotions-coupons-automation)
    @Test
    async fivePercentDiscountApplied_when_advertisedCouponUsed() { // TC: TC-PC-03
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon('happybirthday');

        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.couponDiscountLabelIs('happybirthday', 'Coupon: happybirthday');
        await cartPage.asserts.couponDiscountIs('happybirthday', '-2.50€');
        await cartPage.asserts.subtotalIs('50.00');
        await cartPage.asserts.vatIs('9.50');
        await cartPage.asserts.totalPrice('57.00');
    }

    @Test
    async errorShown_when_invalidCouponApplied() { // TC: TC-PC-04
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon('invalidcoupon');

        await cartPage.asserts.couponDoesNotExist('invalidcoupon');
        await cartPage.asserts.couponDiscountRowCountIs(0);
        await cartPage.asserts.totalPrice('60.00');
    }

    @Test
    async errorShown_when_emptyCouponApplied() { // TC: TC-PC-05
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon('');

        await cartPage.asserts.couponCodeRequired();
        await cartPage.asserts.totalPrice('60.00');
    }

    @Test
    async alreadyAppliedShown_when_sameCouponAppliedTwice() { // TC: TC-PC-06
        const cartPage = await this.openCartWithFalcon9();
        await cartPage.applyCoupon('happybirthday');
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.couponDiscountRowCountIs(1);
        const totalAfterFirstApply = await cartPage.getTotal();

        await cartPage.applyCoupon('happybirthday');

        await cartPage.asserts.couponAlreadyApplied();
        await cartPage.asserts.couponDiscountRowCountIs(1);
        await cartPage.asserts.totalIs(totalAfterFirstApply);
    }

    @Test
    async totalsRestored_when_couponRemoved() { // TC: TC-PC-07
        const cartPage = await this.openCartWithFalcon9();
        const totalBeforeApply = await cartPage.getTotal();
        await cartPage.applyCoupon('happybirthday');
        await cartPage.asserts.couponAppliedSuccessfully();

        await cartPage.removeCoupon('happybirthday');

        await cartPage.asserts.couponRemovedSuccessfully();
        await cartPage.asserts.couponDiscountRowCountIs(0);
        await cartPage.asserts.totalIs(totalBeforeApply);
        await cartPage.asserts.subtotalIs('50.00');
        await cartPage.asserts.vatIs('10.00');
    }

    private async openCartWithFalcon9() {
        await this.app.createPage(MainPage).addRocketToShoppingCart('Falcon 9');
        return this.app.createPage(CartPage);
    }
}
