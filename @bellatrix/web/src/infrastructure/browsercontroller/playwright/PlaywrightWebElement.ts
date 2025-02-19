import { Locator as NativeLocator } from '@playwright/test';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { PlaywrightShadowRootWebElement } from './PlaywrightShadowRootWebElement';

import type { HtmlAttribute } from '@bellatrix/web/types';

export class PlaywrightWebElement extends WebElement {
    private _locator: NativeLocator;

    constructor(locator: NativeLocator) {
        super();
        this._locator = locator;
    }

    override async click(): Promise<void> {
        await this._locator.click({
            timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout,
            trial: true,
        });

        try {
            await this._locator.click({ timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout, noWaitAfter: true, force: true });
        } catch {
            // ignore error, workaround for dialog popup
        }
    }

    override async hover(): Promise<void> {
        await this._locator.hover();
    }

    override async focus(): Promise<void> {
        await this._locator.focus();
    }

    override async setText(value: string) {
        await this._locator.fill(value);
    }

    override async clear() {
        await this._locator.evaluate<string, HTMLInputElement>(node => node.value = '');
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

    override async getOuterHtml(): Promise<string> {
        return await this._locator.evaluate(el => el.outerHTML);
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
        let nativeLocator: NativeLocator;
        switch (locator.type) {
            case 'css':
                nativeLocator = this._locator.locator(`css=${locator.value}`).first();
                break;
            case 'xpath':
                nativeLocator = this._locator.locator(`xpath=${locator.value}`).first();
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
                nativeLocators = await this._locator.locator(`css=${locator.value}`).all();
                break;
            case 'xpath':
                nativeLocators = await this._locator.locator(`xpath=${locator.value}`).all();
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return nativeLocators.map(locator => new PlaywrightWebElement(locator));
    }

    override async evaluate<R, VarArgs extends unknown[]>(script: string, ...args: VarArgs): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if ((args[i] as PlaywrightWebElement).constructor === PlaywrightWebElement) {
                args[i] = await (args[i] as PlaywrightWebElement)['_locator'].elementHandle();
            }

            if ((args[i] as PlaywrightShadowRootWebElement).constructor === PlaywrightShadowRootWebElement) {
                args[i] = (args[i] as PlaywrightShadowRootWebElement)['_shadowNodeElementHandle'];
            }
        }

        return await this._locator.evaluate(new Function(`return (${script})(arguments[0], ...arguments[1])`) as never, args);
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
        if (this.constructor === PlaywrightShadowRootWebElement) {
            return true;
        }

        try {
            return await this._locator.elementHandle() !== null;
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

    override async scrollIntoView(): Promise<void> {
        await this._locator.scrollIntoViewIfNeeded();
    }

    override async getShadowRoot(): Promise<WebElement | null> {
        const shadowRoot = new PlaywrightShadowRootWebElement(this);
        if (!await shadowRoot.tryAttachShadowRoot()) {
            return null;
        }

        return shadowRoot;
    }
}
