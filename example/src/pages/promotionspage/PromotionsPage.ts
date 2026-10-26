import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { PromotionsPageMap } from './PromotionsPageMap';
import { PromotionsPageAsserts } from './PromotionsPageAsserts';

@Page(PromotionsPageMap, PromotionsPageAsserts)
export class PromotionsPage extends WebPage<PromotionsPageMap, PromotionsPageAsserts> {
    private pendingCouponClick?: Promise<unknown>;

    protected override get url() {
        return 'https://demos.bellatrix.solutions/welcome/';
    }

    protected override async waitForPageLoad() {
        await this.map.couponButton.wait.toExist();
    }

    // click() does not return while the alert is open, so it is started without awaiting;
    // acceptCouponAlert() awaits it later. Call asserts.couponAlertMessageIs() first: it waits until the
    // dialog is captured, and dialog.accept() throws at once when none has been.
    clickCouponButton() {
        this.pendingCouponClick = this.map.couponButton.click().then(() => undefined, (e: unknown) => e);
    }

    async acceptCouponAlert() {
        await this.app.dialog.accept();
        const outcome = await this.pendingCouponClick;
        this.pendingCouponClick = undefined;
        if (outcome instanceof Error) {
            throw outcome;
        }
    }
}
