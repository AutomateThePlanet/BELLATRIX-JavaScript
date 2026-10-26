import { Test, TestClass } from '@bellatrix/web/test';
import { Category, Ignore } from '@bellatrix/core/decorators';
import { WebTest } from '@bellatrix/web/infrastructure';
import { ExtraWebHooks } from '@bellatrix/extras-web/hooks';
import { LogLifecyclePlugin, ScreenshotOnFailPlugin } from '@bellatrix/extras-web/plugins';
import { addPlugin } from '@bellatrix/core/infrastructure';

import { Categories } from '../src/Categories';
import { CartPage, CartTotals, MainPage, PromotionsPage } from '../src/pages';

const COUPON = 'happybirthday';
const BASELINE: CartTotals = { subtotal: '50.00', vat: '10.00', total: '60.00' };
const FIVE_PERCENT: CartTotals = { subtotal: '50.00', vat: '9.50', total: '57.00' };

@TestClass
@Category(Categories.Coupons)
export class PromotionsCouponTests extends WebTest {
    override async configure(): Promise<void> {
        await super.configure();
        ExtraWebHooks.addComponentBDDLogging();
        addPlugin(LogLifecyclePlugin);
        addPlugin(ScreenshotOnFailPlugin);
    }

    override async afterEach() {
        await this.app.cookies.clearCookies();
    }

    private async openCartWithFalcon9() {
        await this.app.createPage(MainPage).addRocketToShoppingCart('Falcon 9');
        const cartPage = await this.app.goTo(CartPage);
        await cartPage.asserts.totalsAre(BASELINE);
        return cartPage;
    }

    @Test
    async promotionsPageShowsHeadingAndCouponButton_when_opened() { // TC: TC-PROMO2-01
        const promotionsPage = await this.app.goTo(PromotionsPage);

        await promotionsPage.asserts.pageTitleIs('Promotions – Bellatrix Demos');
        await promotionsPage.asserts.headingIs('Promotions');
        await promotionsPage.asserts.couponButtonShown('Do you want 5% off for your BD?');
    }

    @Test
    async couponAlertShowsCode_when_couponButtonClicked() { // TC: TC-PROMO2-02
        const promotionsPage = await this.app.goTo(PromotionsPage);

        promotionsPage.clickCouponButton();
        await promotionsPage.asserts.couponAlertMessageIs(`Try the coupon- ${COUPON}`);
        await promotionsPage.acceptCouponAlert();

        await promotionsPage.asserts.stillOnPromotionsPage();
        await promotionsPage.asserts.headerCartCountIs('0 items');
    }

    @Test
    @Ignore // BUG-PC-01 advertised 5% coupon gives 10% off
    async advertisedCouponGivesFivePercentOff_when_appliedInCart() { // TC: TC-PROMO2-03
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon(COUPON);

        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.couponDiscountLabelIs(COUPON, `Coupon: ${COUPON}`);
        await cartPage.asserts.couponDiscountIs(COUPON, '-2.50€');
        await cartPage.asserts.totalsAre(FIVE_PERCENT);
    }

    @Test
    async couponLineWithRemoveLinkShown_when_advertisedCouponApplied() { // TC: TC-PROMO2-04
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon(COUPON);

        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.couponDiscountLabelIs(COUPON, `Coupon: ${COUPON}`);
        await cartPage.asserts.removeCouponLinkShown(COUPON);
        await cartPage.asserts.totalIsLessThan(Number(BASELINE.total));
    }

    @Test
    async invalidCouponRejected_when_unknownCodeApplied() { // TC: TC-PROMO2-05
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon('invalidcoupon');

        await cartPage.asserts.couponDoesNotExist('invalidcoupon');
        await cartPage.asserts.couponDiscountRowCountIs(0);
        await cartPage.asserts.totalsAre(BASELINE);
    }

    @Test
    async emptyCouponRejected_when_noCodeEntered() { // TC: TC-PROMO2-06
        const cartPage = await this.openCartWithFalcon9();

        await cartPage.applyCoupon('');

        await cartPage.asserts.couponCodeRequired();
        await cartPage.asserts.couponDiscountRowCountIs(0);
        await cartPage.asserts.totalsAre(BASELINE);
    }

    @Test
    async discountNotDoubled_when_couponAppliedTwice() { // TC: TC-PROMO2-07
        const cartPage = await this.openCartWithFalcon9();
        await cartPage.applyCoupon(COUPON);
        await cartPage.asserts.couponAppliedSuccessfully();
        await cartPage.asserts.totalIsLessThan(Number(BASELINE.total));
        const totalsAfterFirstApply = await cartPage.getTotals();

        await cartPage.applyCoupon(COUPON);

        await cartPage.asserts.couponAlreadyApplied();
        await cartPage.asserts.couponDiscountRowCountIs(1);
        await cartPage.asserts.totalsAre(totalsAfterFirstApply);
    }

    @Test
    async preCouponTotalsRestored_when_couponRemoved() { // TC: TC-PROMO2-08
        const cartPage = await this.openCartWithFalcon9();
        await cartPage.applyCoupon(COUPON);
        await cartPage.asserts.couponAppliedSuccessfully();

        await cartPage.removeCoupon(COUPON);

        await cartPage.asserts.couponRemovedSuccessfully();
        await cartPage.asserts.couponDiscountRowCountIs(0);
        await cartPage.asserts.totalsAre(BASELINE);
    }
}
