import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixWebService } from '@bellatrix/web/services/decorators';
import { Image } from '@bellatrix/core/image';
import { WebService } from '.';

@BellatrixWebService
export class BrowserService extends WebService {
    constructor(driver: BrowserController) {
        super(driver);
    }

    async getUrl(): Promise<string> {
        return await this.driver.getUrl();
    }

    async getTitle(): Promise<string> {
        return await this.driver.getTitle();
    }

    async getPageSource(): Promise<string> {
        return await this.driver.getPageSource();
    }

    async clearLocalStorage(): Promise<void> {
            await this.driver.executeJavascript(() => {
            localStorage.clear();
        });
    }

    async takeScreenshot(): Promise<Image> {
        const base64image = (await this.driver.takeScreenshot()).base64;
        return Image.fromBase64(base64image);
    }

    async back(): Promise<void> {
        return await this.driver.back();
    }

    async forward(): Promise<void> {
        return await this.driver.forward();
    }

    async refresh(): Promise<void> {
        return await this.driver.refresh();
    }

    async waitForAjax() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - sometimes Jest causes problems because it can't find the WebSettings file
        const timeoutSettings = BellatrixSettings.get().webSettings.timeoutSettings;
        const ajaxTimeout = timeoutSettings.waitForAjaxTimeout;
        const sleepInterval = timeoutSettings.sleepInterval;

        await this.driver.waitUntil(async () => {
            const numberOfAjaxConnections = await this.driver.executeJavascript<number | null>(
                // @ts-expect-error - added property to global window object
                () => !isNaN(window.$openHTTPs) ? window.$openHTTPs : null);
            if (numberOfAjaxConnections !== null) {
                return numberOfAjaxConnections === 0;
            } else {
                await this.monkeyPatchXMLHttpRequest();
            }

            return false;
        }, ajaxTimeout, sleepInterval);
    }

    async waitUntilPageLoadsCompletely() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - sometimes Jest causes problems because it can't find the WebSettings file
        const timeoutSettings = BellatrixSettings.get().webSettings.timeoutSettings;
        const waitUntilReadyTimeout = timeoutSettings.pageLoadTimeout;
        const sleepInterval = timeoutSettings.sleepInterval;

        await this.driver.waitUntil(async () => {
            const readyState = await this.driver.executeJavascript(() => document.readyState);
            return readyState === 'complete';
        }, waitUntilReadyTimeout, sleepInterval);
    }

    private async monkeyPatchXMLHttpRequest() {
        await this.driver.executeJavascript(function() {
            const oldOpen = XMLHttpRequest.prototype.open;
            // @ts-expect-error - added property to global window object
            window.$openHTTPs = 0;
            XMLHttpRequest.prototype.open = function() {
                // @ts-expect-error - added property to global window object
                window.$openHTTPs++;
                this.addEventListener('readystatechange', function() {
                    if (this.readyState === 4) {
                        // @ts-expect-error - added property to global window object
                        window.$openHTTPs--;
                    }
                }, false);
                // eslint-disable-next-line prefer-rest-params
                oldOpen.apply(this, arguments as never);
            };
        });
    }
}
