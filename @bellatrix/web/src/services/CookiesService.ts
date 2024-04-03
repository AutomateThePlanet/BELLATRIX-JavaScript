import { Cookie, BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";

export class CookiesService extends WebService {
    constructor(driver: BrowserAutomationTool) {
        super(driver);
    }

    async addCookie(name: string, value: string, path?: string): Promise<void>
    async addCookie(cookie: Cookie): Promise<void>
    async addCookie(cookieOrName: Cookie | string, value?: string, path: string = '/'): Promise<void> {
        if (typeof cookieOrName === 'string') {
            const name = cookieOrName;
            await this.driver.addCookie({name, value: value!, path});
            return;
        }

        const cookie = cookieOrName;
        await this.driver.addCookie(cookie);
    }

    async clearCookies(): Promise<void> {
        await this.driver.clearCookies();
    }

    async deleteCookie(name: string): Promise<void> {
        await this.driver.deleteCookie(name);
    }

    async getAllCookies(): Promise<Cookie[]> {
        return await this.driver.getAllCookies();
    }

    async getCookie(name: string): Promise<Cookie | null> {
        return await this.driver.getCookie(name);
    }
}