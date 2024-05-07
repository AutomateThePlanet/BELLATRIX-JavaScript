import { ElementHandle as NativeElementHandle } from '@playwright/test';

import { Locator, WebElement } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { Utilities } from '@bellatrix/core/utilities';
import { PlaywrightWebElement } from ".";

export class PlaywrightShadowRootWebElement extends PlaywrightWebElement {
    private _shadowNodeElementHandle!: NativeElementHandle<ShadowRoot | Element>;

    constructor(webElement: PlaywrightWebElement | PlaywrightShadowRootWebElement, shadowNodeElementHandle?: NativeElementHandle<Element> | null) {
        super(webElement['_locator']);
        if (Object.hasOwn(webElement, '_shadowRoot')) {
            this._shadowNodeElementHandle = shadowNodeElementHandle!;
        }
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        let nativeElementHandle: NativeElementHandle<Element> | null | undefined;
        switch (locator.type) {
            case 'css':
                nativeElementHandle = await this._shadowNodeElementHandle.$(locator.value);
                break;
            case 'xpath':
                const cssLocators = Utilities.relativeXpathToAbsoluteCss(await this._shadowNodeElementHandle.innerHTML(), locator.value);
                nativeElementHandle = await this._shadowNodeElementHandle.$(cssLocators[0]);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        if (!nativeElementHandle) {
            throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        }

        return new PlaywrightShadowRootWebElement(this, nativeElementHandle);
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let nativeElementHandles: (NativeElementHandle<Element> | null | undefined)[];
        switch (locator.type) {
            case 'css':
                nativeElementHandles = await this._shadowNodeElementHandle.$$(locator.value);
                break;
            case 'xpath':
                const cssLocators = Utilities.relativeXpathToAbsoluteCss(await this._shadowNodeElementHandle.innerHTML(), locator.value);
                nativeElementHandles = await Promise.all(cssLocators.map(async cssLocator => await this._shadowNodeElementHandle.$(cssLocator)));
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return nativeElementHandles.map(nativeElementHandle => new PlaywrightShadowRootWebElement(this, nativeElementHandle));
    }

    async tryAttachShadowRoot(): Promise<boolean> {
        if (this._shadowNodeElementHandle) {
            return true;
        }

        const shadowRoot = (await this['_locator'].evaluateHandle(el => el.shadowRoot)).asElement();
        
        if (!shadowRoot) {
            return false;
        }

        this._shadowNodeElementHandle = shadowRoot;
        return true;
    }
}