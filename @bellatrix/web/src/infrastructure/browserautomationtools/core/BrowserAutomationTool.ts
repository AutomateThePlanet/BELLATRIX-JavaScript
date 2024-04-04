import { Locator, WebElement } from '.';

export type Cookie = {
    name: string;
    value: string;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expires?: number;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

export abstract class BrowserAutomationTool {
    abstract get type(): string;

    abstract getUrl(): Promise<string>;
    abstract getTitle(): Promise<string>;
    abstract getPageSource(): Promise<string>;
    abstract back(): Promise<void>;
    abstract forward(): Promise<void>;
    abstract refresh(): Promise<void>;
    abstract close(): Promise<void>;
    abstract quit(): Promise<void>;
    abstract open(url: string): Promise<void>;
    abstract findElement(locator: Locator): Promise<WebElement>;
    abstract findElements(locator: Locator): Promise<WebElement[]>;
    abstract addCookie(cookie: Cookie): Promise<void>;
    abstract deleteCookie(name: string): Promise<void>;
    abstract getCookie(name: string): Promise<Cookie | null>;
    abstract getAllCookies(): Promise<Cookie[]>;
    abstract clearCookies(): Promise<void>;
    abstract executeJavascript<T, VarArgs extends any[] = []>(script: string | ((...args: VarArgs) => T), ...args: VarArgs): Promise<T>;
    abstract waitUntil(condition: (browserAutomationTool: Omit<BrowserAutomationTool, 'waitUntil'>) => boolean | Promise<boolean>, timeout: number, pollingInterval: number): Promise<void>
};