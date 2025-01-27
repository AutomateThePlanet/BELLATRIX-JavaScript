import { Locator as NativeLocator, ElementHandle as NativeElementHandle } from '@playwright/test';

import { Utilities } from '@bellatrix/web/utilities';
import { Locator, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { PlaywrightWebElement } from './PlaywrightWebElement';

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
        const searchContext = this._shadowNodeElementHandle ?? this['_locator'];
        switch (locator.type) {
            case 'css':
                nativeElementHandle = await searchContext.$(locator.value);
                break;
            case 'xpath':
                const cssLocators = await Utilities.relativeXpathToAbsoluteCss(this, locator.value);

                if (cssLocators.length === 0) {
                    break;
                }

                const shadowRoot = this._shadowNodeElementHandle ?? await this['_locator'].evaluateHandle((el: Node) => {
                    while (el.parentNode) {
                        el = el.parentNode;
                    }

                    return el;
                });

                nativeElementHandle = await shadowRoot.$(cssLocators[0]);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        if (!nativeElementHandle) {
            throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        }

        const webElement = new PlaywrightShadowRootWebElement(this, nativeElementHandle);
        webElement['_locator'] = nativeElementHandle as unknown as NativeLocator; // They have the same methods, the different ones are overriden
        return webElement;
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let nativeElementHandles: (NativeElementHandle<Element> | null | undefined)[];
        const searchContext = this._shadowNodeElementHandle ?? this['_locator'];
        switch (locator.type) {
            case 'css':
                nativeElementHandles = await searchContext.$$(locator.value);
                break;
            case 'xpath':
                const cssLocators = await Utilities.relativeXpathToAbsoluteCss(this, locator.value);

                const shadowRoot = this._shadowNodeElementHandle ?? await this['_locator'].evaluateHandle((el: Node) => {
                    while (el.parentNode) {
                        el = el.parentNode;
                    }

                    return el;
                });

                nativeElementHandles = await Promise.all(cssLocators.map(async cssLocator => await shadowRoot.$(cssLocator)));
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return nativeElementHandles.map(nativeElementHandle => {
            const webElement = new PlaywrightShadowRootWebElement(this, nativeElementHandle);
            webElement['_locator'] = nativeElementHandle as unknown as NativeLocator; // They have the same methods, the different ones are overriden
            return webElement;
        });
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

        const searchContext = this._shadowNodeElementHandle ?? this['_locator'];
        return await searchContext.evaluate(new Function(`return (${script})(arguments[0], ...arguments[1])`) as never, args);
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
