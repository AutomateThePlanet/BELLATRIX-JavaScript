import { WebElement as NativeWebElement, WebDriver as NativeWebDriver, until, By } from 'selenium-webdriver';
import { ShadowRoot as SeleniumShadowRoot } from 'selenium-webdriver/lib/webdriver';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { SeleniumWebElement } from '.';

import { Utilities } from '@bellatrix/core/utilities';

export class SeleniumShadowRootWebElement extends SeleniumWebElement {
    private _shadowRoot: SeleniumShadowRoot;

    constructor(element: NativeWebElement, driver: NativeWebDriver, shadowRoot: SeleniumShadowRoot) {
        super(element, driver);
        this._shadowRoot = shadowRoot;
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        let by: By;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                const innerHtml = await this.evaluate<string>((el: ShadowRoot) => el.innerHTML);
                const cssLocators = Utilities.relativeXpathToAbsoluteCss(innerHtml, locator.value);
                by = By.css(cssLocators[0]);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return new SeleniumWebElement(await this['_element'].findElement(by), this['_driver']);
        // TODO: WAIT/RETRY LOGIC
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let by: By | By[];
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                const cssLocators = Utilities.relativeXpathToAbsoluteCss(await this.getInnerHtml(), locator.value);
                by = cssLocators.map(cssLocator => By.css(cssLocator));
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        if (Array.isArray(by)) {
            const promiseArray = by.map(async byCss => new SeleniumWebElement(await this['_element'].findElement(byCss), this['_driver']));
            return await Promise.all(promiseArray);
        }

        const elements = await this['_element'].findElements(by);
        return elements.map(el => new SeleniumWebElement(el, this['_driver']) /* TODO: handle error? */);
    }
}