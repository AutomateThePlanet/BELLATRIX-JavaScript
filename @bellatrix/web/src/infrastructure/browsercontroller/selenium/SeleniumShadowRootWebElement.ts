import { WebElement as NativeWebElement, WebDriver as NativeWebDriver, By } from 'selenium-webdriver';
import { ShadowRoot as SeleniumShadowRoot } from 'selenium-webdriver/lib/webdriver';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { SeleniumWebElement } from './SeleniumWebElement';

import { Utilities } from '@bellatrix/web/utilities';

export class SeleniumShadowRootWebElement extends SeleniumWebElement {
    private _shadowRoot: SeleniumShadowRoot;
    private _isRoot: boolean;

    constructor(element: NativeWebElement, driver: NativeWebDriver, shadowRoot: SeleniumShadowRoot, isRoot: boolean) {
        super(element, driver);
        this._shadowRoot = shadowRoot;
        this._isRoot = isRoot;
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        switch (locator.type) {
            case 'css':
                const searchContext = this._isRoot ? this._shadowRoot : this['_element'];
                return new SeleniumShadowRootWebElement(await searchContext.findElement(By.css(locator.value)), this['_driver'], this._shadowRoot, false);
            case 'xpath':
                const cssLocators = await Utilities.relativeXpathToAbsoluteCss(this, locator.value);

                if (cssLocators.length === 0) {
                    break;
                }

                return new SeleniumShadowRootWebElement(await this._shadowRoot.findElement(By.css(cssLocators[0])), this['_driver'], this._shadowRoot, false);
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        throw Error(`Element at ${locator.value} not found.`); // TODO: better error handling?
        // TODO: WAIT/RETRY LOGIC
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let by: By | By[] | undefined;
        let searchContext: SeleniumShadowRoot | NativeWebElement;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                searchContext = this._isRoot ? this._shadowRoot : this['_element'];
                break;
            case 'xpath':
                const cssLocators = await Utilities.relativeXpathToAbsoluteCss(this, locator.value);
                searchContext = this._shadowRoot;
                if (cssLocators.length === 0) {
                    break;
                }

                by = cssLocators.map(cssLocator => By.css(cssLocator));
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        if (by === undefined) {
            throw Error(`Element at ${locator.value} not found.`);
        }

        if (Array.isArray(by)) {
            const promiseArray = by.map(async byCss => new SeleniumShadowRootWebElement(await this._shadowRoot.findElement(byCss), this['_driver'], this._shadowRoot, false));
            return await Promise.all(promiseArray);
        }

        const elements = await this._shadowRoot.findElements(by);
        return elements.map(el => new SeleniumShadowRootWebElement(el, this['_driver'], this._shadowRoot, false) /* TODO: handle error? */);
    }

    override async evaluate<R>(script: string | Function, ...args: unknown[]): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if ((args[i] as SeleniumWebElement).constructor === SeleniumWebElement) {
                args[i] = (args[i] as SeleniumWebElement)['_element'];
            }

            if ((args[i] as SeleniumShadowRootWebElement).constructor === SeleniumShadowRootWebElement) {
                if ((args[i] as SeleniumShadowRootWebElement)._isRoot) {
                    args[i] = await (args[i] as SeleniumShadowRootWebElement).evaluate('el => el.shadowRoot');
                } else {
                    args[i] = (args[i] as SeleniumShadowRootWebElement)['_element'];
                }
            }
        }

        if (this._isRoot) {
            return await this['_driver'].executeScript<R>(`arguments[0] = arguments[0].shadowRoot; return (${script})(...arguments)`, this['_element'], ...args);
        } else {
            return await this['_driver'].executeScript<R>(`return (${script})(...arguments)`, this['_element'], ...args);
        }
    }
}
