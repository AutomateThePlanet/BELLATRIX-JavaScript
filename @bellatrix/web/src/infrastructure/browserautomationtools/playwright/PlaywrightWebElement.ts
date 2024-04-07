import { Locator as NativeLocator } from '@playwright/test';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';

import type { HtmlAttribute } from '@bellatrix/web/types';
import { BellatrixSettings } from '@bellatrix/core/settings';

export class PlaywrightWebElement extends WebElement {
    private _locator: NativeLocator;

    constructor(locator: NativeLocator) {
        super();
        this._locator = locator;
    }

    override async click(): Promise<void> {
        await this._locator.click(); // TODO: { timeout: 10_000 } for click timeout 10 seconds
    }

    override async hover(): Promise<void> {
        await this._locator.hover();
    }

    override async setText(value: string) {
        await this._locator.fill(value);
    }

    override async clear() {
        await this._locator.evaluate(node => node.value = '');
    }

    override async getAttribute(name: HtmlAttribute): Promise<string> {
        return await this._locator.getAttribute(name) ?? '';
    }

    override async getInnerText(): Promise<string> {
        return (await this._locator.innerText()).trim();
    }

    override async getInnerHtml(): Promise<string> {
        return await this._locator.innerHTML();
    }

    override async isChecked(): Promise<boolean> {
        return await this._locator.isChecked();
    }

    override async setChecked(checked: boolean): Promise<void> {
        await this._locator.setChecked(checked);
    }

    override async setInputFile(filePath: string): Promise<void> {
        await this._locator.setInputFiles(filePath);
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        const nativeLocator: NativeLocator = this._locator.locator(locator.value).first();

        try {
            nativeLocator.waitFor({ timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout });
        } catch {
            throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        }

        return new PlaywrightWebElement(nativeLocator);
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        const nativeLocators: NativeLocator[] = await this._locator.locator(locator.value).all();

        return nativeLocators.map(locator => new PlaywrightWebElement(locator));
    }

    override async evaluate<R>(script: string, ...args: any[]): Promise<R> {
        return await this._locator.evaluate(new Function("a", script) as any, args); // remove any
        // TODO: needs testing
        // TODO: script to be the same between selenium and playwright
    }

    override async selectByText(text: string): Promise<void> {
        await this._locator.selectOption({ label: text });
    }

    override async selectByIndex(index: number): Promise<void> {
        await this._locator.selectOption({ index: index });
    }

    override async selectByValue(value: string): Promise<void> {
        await this._locator.selectOption({ value: value });
    }

    override async isPresent(): Promise<boolean> {
        try {
            return await this._locator.elementHandle() != null;
        } catch {
            return false;
        }
    }

    override async isVisible(): Promise<boolean> {
        return await this._locator.isVisible();
    }

    override async isClickable(): Promise<boolean> {
        return await this._locator.isEnabled();
    }
}