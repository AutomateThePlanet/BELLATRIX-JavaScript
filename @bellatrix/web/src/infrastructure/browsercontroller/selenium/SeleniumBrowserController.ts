import { By, WebDriver as NativeWebDriver, until } from 'selenium-webdriver';

import { Cookie, BrowserController, WebElement, Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { SeleniumShadowRootWebElement, SeleniumWebElement } from '@bellatrix/web/infrastructure/browsercontroller/selenium';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { Image } from '@bellatrix/core/image';

export class SeleniumBrowserController extends BrowserController {
    private _driver: NativeWebDriver;

    constructor(driver: NativeWebDriver) {
        super();
        this._driver = driver;
    }

    override get type(): string {
        return 'selenium';
    }

    get wrappedDriver(): NativeWebDriver {
        return this._driver;
    }

    override async getUrl(): Promise<string> {
        return await this.wrappedDriver.getCurrentUrl();
    }

    override async getTitle(): Promise<string> {
        return await this.wrappedDriver.getTitle();
    }

    override async getPageSource(): Promise<string> {
        return await this.wrappedDriver.getPageSource();
    }

    override async getScreenshot(): Promise<Image> {
        const base64image = (await this.wrappedDriver.takeScreenshot());
        return Image.fromBase64(base64image);
    }

    override async back(): Promise<void> {
        await this.wrappedDriver.navigate().back();
    }

    override async forward(): Promise<void> {
        await this.wrappedDriver.navigate().forward();
    }

    override async refresh(): Promise<void> {
        await this.wrappedDriver.navigate().refresh();
    }

    override async close(): Promise<void> {
        await this.wrappedDriver.close();
    }

    override async quit(): Promise<void> {
        await this.wrappedDriver.quit();
    }

    override async open(url: string): Promise<void> {
        await this.wrappedDriver.get(url);
        await this.isPageFullyLoaded();
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        let by: By;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                by = By.xpath(locator.value);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return new SeleniumWebElement(await this._driver.wait(until.elementLocated(by), BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout), this._driver /* TODO: handle error? */);
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let by: By;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                by = By.xpath(locator.value);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        const elements = await this._driver.findElements(by);
        return elements.map(el => new SeleniumWebElement(el, this._driver) /* TODO: handle error? */);
    }

    override async addCookie(cookie: Cookie): Promise<void> {
        const { name, value, path, domain, secure, httpOnly, expires: expiry } = cookie;
        await this.wrappedDriver.manage().addCookie({ name, value, path, domain, secure, httpOnly, expiry }); // sameSite unsupported in selenium javascript?
    }

    override async clearCookies(): Promise<void> {
        await this.wrappedDriver.manage().deleteAllCookies();
    }

    override async getCookie(name: string): Promise<Cookie> {
        const cookie = await this.wrappedDriver.manage().getCookie(name);
        return cookie;
    }

    override async getAllCookies(): Promise<Cookie[]> {
        const cookies = await this.wrappedDriver.manage().getCookies();
        return cookies;
    }

    override async deleteCookie(name: string): Promise<void> {
        await this.wrappedDriver.manage().deleteCookie(name);
    }

    override async executeJavascript<T, VarArgs extends unknown[]>(script: string | ((...args: VarArgs) => T), ...args: VarArgs): Promise<T> {
        for (let i = 0; i < args.length; i++) {
            if ((args[i] as SeleniumWebElement).constructor === SeleniumWebElement) {
                args[i] = (args[i] as SeleniumWebElement)['_element'];
            }

            if ((args[i] as SeleniumShadowRootWebElement).constructor === SeleniumShadowRootWebElement) {
                args[i] = await this.executeJavascript('el => el.shadowRoot', (args[i] as SeleniumShadowRootWebElement)['_element']);
            }
        }

        return await this.wrappedDriver.executeScript<T>(`return (${script})(...arguments)`, ...args);
    }

    override async waitUntil(condition: (browserController: Omit<BrowserController, 'waitUntil'>) => boolean | Promise<boolean>, timeout: number, pollingInterval: number): Promise<void> {
        await this.wrappedDriver.wait(condition.bind(this, this), timeout, 'Condition failed.' /* TODO: better message */, pollingInterval);
    }

    override async acceptDialog(promptText?: string | undefined): Promise<void> {
        const alert = await this.wrappedDriver.switchTo().alert();

        if (promptText) {
            await alert.sendKeys(promptText);
        }

        await alert.accept();
        await this.wrappedDriver.switchTo().defaultContent();
    }

    override async dismissDialog(): Promise<void> {
        await this.wrappedDriver.switchTo().alert().dismiss();

        await this.wrappedDriver.switchTo().defaultContent();
    }

    override async getDialogMessage(): Promise<string> {
        const message = await this.wrappedDriver.switchTo().alert().getText();

        await this.wrappedDriver.switchTo().defaultContent();

        return message;
    }

    private async isPageFullyLoaded() {
        const driver = this.wrappedDriver;
        await driver.wait(async () => {
            const readyState = await driver.executeScript(() => document.readyState);
            return readyState === 'complete';
        }, BellatrixSettings.get().webSettings.timeoutSettings.pageLoadTimeout);
    }
}
