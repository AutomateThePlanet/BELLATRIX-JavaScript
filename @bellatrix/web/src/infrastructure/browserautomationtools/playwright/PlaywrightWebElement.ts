import { Locator as NativeLocator } from '@playwright/test';

import { WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';

import type { HtmlAttribute } from '@bellatrix/web/types';

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
}