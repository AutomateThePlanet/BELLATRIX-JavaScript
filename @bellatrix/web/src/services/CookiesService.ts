import { Cookie, BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { BellatrixWebService } from '@bellatrix/web/services/decorators';
import { WebService } from '.';

@BellatrixWebService
export class CookiesService extends WebService {
    constructor(driver: BrowserController) {
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
