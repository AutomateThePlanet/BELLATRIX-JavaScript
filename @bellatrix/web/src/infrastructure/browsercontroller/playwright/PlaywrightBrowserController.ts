import { Browser, BrowserContext, Page, Locator as NativeLocator, Dialog } from '@playwright/test';

import { Cookie, BrowserController, WebElement, Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { PlaywrightWebElement } from '@bellatrix/web/infrastructure/browsercontroller/playwright';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { HttpClient } from '@bellatrix/core/http';

export class PlaywrightBrowserController extends BrowserController {
    private _browser: Browser;
    private _context: BrowserContext;
    private _page: Page;
    private _gridSessionId: string | undefined;
    private _dialog: Dialog | undefined;
    private _dialogAutoDismiss: number | NodeJS.Timeout | undefined;

    constructor(browser: Browser, context: BrowserContext, page: Page) {
        super();
        this._browser = browser;
        this._context = context;
        this._page = page;

        this._page.on('dialog', dialog => {
            this._dialog = dialog;
            this._dialogAutoDismiss = setTimeout(() => {
                void this._dialog?.dismiss();
                this._dialog = undefined;
            }, 5_000); // dismiss dialog if no action after 5 seconds
        });
    }

    override get type(): string {
        return 'playwright';
    }

    get browser(): Browser {
        return this._browser;
    }

    override async getUrl(): Promise<string> {
        return this._page.url();
    }

    override async getTitle(): Promise<string> {
        return await this._page.title();
    }

    override async getPageSource(): Promise<string> {
        return await this._page.content();
    }

    override async back(): Promise<void> {
        await this._page.goBack();
    }

    override async forward(): Promise<void> {
        await this._page.goForward();
    }

    override async refresh(): Promise<void> {
        await this._page.reload();
    }

    override async close(): Promise<void> {
        await this._page.close();
    }

    override async quit(): Promise<void> {
        await this.browser.close();
        const webSettings = BellatrixSettings.get().webSettings;

        if (webSettings.executionSettings.executionType === 'remote'
            && (webSettings.remoteExecutionSettings?.provider === 'Selenium Grid'
             || webSettings.remoteExecutionSettings?.provider === 'Selenoid')
        ) {
            await new HttpClient(new URL(webSettings.remoteExecutionSettings.remoteUrl)).sendRequest({ path: `/session/${this._gridSessionId}`, method: 'DELETE' });
        }
    }

    override async open(url: string): Promise<void> {
        await this._page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        let nativeLocator: NativeLocator;
        switch (locator.type) {
            case 'css':
                nativeLocator = this._page.locator(`css=${locator.value}`).first();
                break;
            case 'xpath':
                nativeLocator = this._page.locator(`xpath=${locator.value}`).first();
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        try {
            await nativeLocator.waitFor({ timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout });
        } catch {
            throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        }

        return new PlaywrightWebElement(nativeLocator);
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let nativeLocators: NativeLocator[];
        switch (locator.type) {
            case 'css':
                nativeLocators = await this._page.locator(`css=${locator.value}`).all();
                break;
            case 'xpath':
                nativeLocators = await this._page.locator(`xpath=${locator.value}`).all();
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

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

    override async executeJavascript<R, VarArgs extends unknown[] = []>(script: string | ((...args: VarArgs) => R), ...args: VarArgs): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof PlaywrightWebElement) {
                args[i] = await (args[i] as PlaywrightWebElement)['_locator'].elementHandle();
            }
        }

        return await this._page.evaluate<R, VarArgs>(new Function(`return (${script})(...arguments[0])`) as never, args);
    }

    override async waitUntil(condition: (browserController: Omit<BrowserController, 'waitUntil'>) => boolean | Promise<boolean>, timeout: number, pollingInterval: number): Promise<void> {
        const startTime = Date.now();
        const hasTimeoutEnded = () => Date.now() - startTime > timeout;
        let error: Error | undefined;

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

        error ??= Error('Condition failed'); // method threw but e is not instance of Error
        throw error;
    }

    override async acceptDialog(promptText?: string | undefined): Promise<void> {
        this.checkForDialog();
        await this._dialog!.accept(promptText);
        this.clearDialog();
    }

    override async dismissDialog(): Promise<void> {
        this.checkForDialog();
        await this._dialog!.dismiss();
        this.clearDialog();
    }

    override async getDialogMessage(): Promise<string> {
        this.checkForDialog();
        return this._dialog!.message();
    }

    setGridSessionId(sessionId?: string) {
        this._gridSessionId = sessionId;
    }

    private checkForDialog(): void {
        if (!this._dialog) {
            throw Error('Dialog not found.'); // TODO: More descriptive message
        }
    }

    private clearDialog(): void {
        if (this._dialogAutoDismiss) {
            clearTimeout(this._dialogAutoDismiss);
        }
        this._dialog = undefined;
    }
}
