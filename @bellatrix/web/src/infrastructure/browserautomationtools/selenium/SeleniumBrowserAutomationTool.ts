import { By, WebDriver as NativeWebDriver, until } from 'selenium-webdriver';

import { Cookie, BrowserAutomationTool, WebElement, Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { SeleniumWebElement } from '@bellatrix/web/infrastructure/browserautomationtools/selenium';
import { BellatrixSettings } from '@bellatrix/core/settings';

export class SeleniumBrowserAutomationTool extends BrowserAutomationTool {
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
        return elements.map(element => new SeleniumWebElement(element, this._driver) /* TODO: handle error? */);
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

    override async executeJavascript<T, VarArgs extends any[]>(script: string | ((...args: VarArgs) => T), ...args: VarArgs): Promise<T> {
        return await this.wrappedDriver.executeScript<T>(script, ...args);
    }

    override async waitUntil(condition: (browserAutomationTool: Omit<BrowserAutomationTool, 'waitUntil'>) => boolean | Promise<boolean>, timeout: number, pollingInterval: number): Promise<void> {
        const driver = this;
        await this.wrappedDriver.wait(condition.bind(this, driver), timeout, 'Condition failed.' /* TODO: better message */, pollingInterval);
    }

    private async isPageFullyLoaded() {
        const driver = this.wrappedDriver;
        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, BellatrixSettings.get().webSettings.timeoutSettings.pageLoadTimeout);
    }
}