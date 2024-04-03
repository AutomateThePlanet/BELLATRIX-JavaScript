import { Browser, BrowserContext, Page, Locator as NativeLocator } from '@playwright/test';

import { Cookie, BrowserAutomationTool, WebElement, Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { PlaywrightWebElement } from '@bellatrix/web/infrastructure/browserautomationtools/playwright';
import { BellatrixSettings } from '@bellatrix/core/settings';

export class PlaywrightBrowserAutomationTool extends BrowserAutomationTool {
    private _browser: Browser;
    private _context: BrowserContext;
    private _page: Page;

    constructor(browser: Browser, context: BrowserContext, page: Page) {
        super();
        this._browser = browser;
        this._context = context;
        this._page = page;
    }

    override get type(): string {
        return 'playwright';
    }

    get browser(): Browser {
        return this._browser;
    }

    override async close(): Promise<void> {
        await this._page.close();
    }

    override async quit(): Promise<void> {
        await this.browser.close();
    }

    override async open(url: string): Promise<void> {
        await this._page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        const nativeLocator: NativeLocator = this._page.locator(locator.value).first();

        try {
            nativeLocator.waitFor({ timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout });
        } catch {
            throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        }

        return new PlaywrightWebElement(nativeLocator);
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        const nativeLocators: NativeLocator[] = await this._page.locator(locator.value).all();
        return nativeLocators.map(locator => new PlaywrightWebElement(locator));
    }

    override async addCookie(cookie: Cookie): Promise<void> {
        await this._context.addCookies([cookie]);
    }

    override async clearCookies(): Promise<void> {
        await this._context.clearCookies();
    }

    override async getCookie(name: string): Promise<Cookie | null> {
        const cookies = await this.getAllCookies();
        const cookie = cookies.find(c => c.name === name);
        return cookie ?? null;
    }

    override async getAllCookies(): Promise<Cookie[]> {
        const currentUrl = new URL(this._page.url());
        const domain = currentUrl.hostname;
        return await this._context.cookies(domain);
    }

    override async deleteCookie(name: string): Promise<void> {
        const cookies = await this.getAllCookies();
        const updatedCookies = cookies.filter(cookie => cookie.name !== name);
        await this._context.clearCookies();
        await this._context.addCookies(updatedCookies);
    }
    
    override async executeJavascript<T, VarArgs extends any[]>(script: string | ((...args: VarArgs) => T), ...args: VarArgs): Promise<T> {
        return await this._page.evaluate<T, VarArgs>(typeof script === 'string' ? this.fixJavascript(script) : () => script(...args), args);
    }

    override async waitUntil(condition: (browserAutomationTool: Omit<BrowserAutomationTool, 'waitUntil'>) => boolean | Promise<boolean>, timeout: number, pollingInterval: number): Promise<void> {
        const startTime = Date.now();
        const hasTimeoutEnded = () => Date.now() - startTime > timeout;
        let error: Error | undefined

        while (!hasTimeoutEnded()) {
            let result = false;
            try {
                result = await condition.call(this, this);
                if (result) return;
                await new Promise(resolve => setTimeout(resolve, pollingInterval));
            } catch (e) {
                if (e instanceof Error) {
                    error = e;
                }
            }
        }

        error ??= Error('Condition failed');
        throw error;
    }

    private fixJavascript(script: string): string {
        return `(() => { ${script} })()`;
    }
}