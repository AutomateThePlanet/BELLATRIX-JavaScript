import { WebPage } from '@bellatrix/web/pages';
import { Page } from '@bellatrix/web/pages/decorators';
import { PromotionsPageMap } from './PromotionsPageMap';
import { PromotionsPageAsserts } from './PromotionsPageAsserts';

@Page(PromotionsPageMap, PromotionsPageAsserts)
export class PromotionsPage extends WebPage<PromotionsPageMap, PromotionsPageAsserts> {
    private pendingAlertClick: Promise<unknown> | undefined;

    protected override get url() {
        return 'https://demos.bellatrix.solutions/welcome/';
    }

    protected override async waitForPageLoad() {
        await this.map.couponButton.wait.toExist();
    }

    // click() does not return while the alert is open (it resolves only after the controller's 5 s
    // auto-dismiss), so the click is left pending here and awaited in acceptAlert().
    async openCouponAlert() {
        // The outcome is captured here so a failed alert assert cannot leave an unhandled rejection.
        this.pendingAlertClick = this.map.couponButton.click().then(() => undefined, (e: unknown) => e);
    }

    async acceptAlert() {
        await this.app.dialog.accept();
        const clickError = await this.pendingAlertClick;
        this.pendingAlertClick = undefined;
        if (clickError) {
            throw clickError;
        }
    }
}
