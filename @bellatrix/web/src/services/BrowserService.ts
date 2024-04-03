import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";
import { BellatrixSettings } from "@bellatrix/core/settings";

export class BrowserService extends WebService {
    constructor(driver: BrowserAutomationTool) {
        super(driver);
    }

    async waitForAjax() {
        const ajaxTimeout = BellatrixSettings.get().webSettings.timeoutSettings.waitForAjaxTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;

        await this.driver.waitUntil(async () => {
            const numberOfAjaxConnections = await this.driver.executeJavascript<number | null>('return !isNaN(window.openHTTPs) ? window.openHTTPs : null');
            if (numberOfAjaxConnections !== null) {
                return numberOfAjaxConnections === 0;
            } else {
                await this.monkeyPatchXMLHttpRequest();
            }

            return false;
        }, ajaxTimeout, sleepInterval)
    }

    async waitUntilPageLoadsCompletely() {
        const waitUntilReadyTimeout = BellatrixSettings.get().webSettings.timeoutSettings.pageLoadTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;

        await this.driver.waitUntil(async () => {
            const readyState = await this.driver.executeJavascript('return document.readyState');
            return readyState === 'complete';
        }, waitUntilReadyTimeout, sleepInterval);
    }

    private async monkeyPatchXMLHttpRequest() {
        await this.driver.executeJavascript(`(function() {
                const oldOpen = XMLHttpRequest.prototype.open;
                window.openHTTPs = 0;
                XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                    window.openHTTPs++;
                    this.addEventListener('readystatechange', function() {
                        if (this.readyState == 4) {
                            window.openHTTPs--;
                    }
                }, false);
                    oldOpen.call(this, method, url, async, user, pass);
                }
            })();`);
    }
}