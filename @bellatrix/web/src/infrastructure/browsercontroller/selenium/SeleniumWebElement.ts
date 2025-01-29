import { WebElement as NativeWebElement, WebDriver as NativeWebDriver, By } from 'selenium-webdriver';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { SeleniumShadowRootWebElement } from './SeleniumShadowRootWebElement';

import type { HtmlAttribute } from '@bellatrix/web/types';

export class SeleniumWebElement extends WebElement {
    private _element: NativeWebElement;
    private _driver: NativeWebDriver;

    constructor(element: NativeWebElement, driver: NativeWebDriver) {
        super();
        this._element = element;
        this._driver = driver;
    }

    override async click() {
        await this._element.click();
    }

    override async hover() {
        const actions = this._driver.actions();
        await actions
            .move({origin: this._element})
            .perform();
    }

    override async focus() {
        await this.evaluate((el: HTMLElement) => el.focus());
    }

    override async setText(value: string) {
        await this._element.clear();
        await this._element.sendKeys(value);
    }

    override async clear() {
        await this._element.clear();
    }

    override async getAttribute(name: HtmlAttribute): Promise<string> {
        return await this._element.getAttribute(name);
    }

    override async getInnerText(): Promise<string> {
        return (await this._element.getText()).trim();
    }

    override async getInnerHtml(): Promise<string> {
        return await this._element.getAttribute('innerHTML');
    }

    override async getOuterHtml(): Promise<string> {
        return await this._element.getAttribute('outerHTML');
    }

    override async isChecked(): Promise<boolean> {
        return await this._element.isSelected();
    }

    override async setChecked(checked: boolean): Promise<void> {
        if ((!checked && await this.isChecked()) || (checked && !(await this.isChecked()))) {
            await this._element.click();
        }
    }

    override async setInputFile(filePath: string): Promise<void> {
        return await this._element.sendKeys(filePath);
    }

    override async findElement(locator: Locator): Promise<WebElement> {
        let by: By;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                by = By.xpath(locator.value);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return new SeleniumWebElement(await this._element.findElement(by), this._driver);
        // TODO: WAIT/RETRY LOGIC
    }

    override async findElements(locator: Locator): Promise<WebElement[]> {
        let by: By;
        switch (locator.type) {
            case 'css':
                by = By.css(locator.value);
                break;
            case 'xpath':
                by = By.xpath(locator.value);
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        const elements = await this._element.findElements(by);
        return elements.map(el => new SeleniumWebElement(el, this._driver) /* TODO: handle error? */);
    }

    override async evaluate<R>(script: string | Function, ...args: unknown[]): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if ((args[i] as SeleniumWebElement).constructor === SeleniumWebElement) {
                args[i] = (args[i] as SeleniumWebElement)['_element'];
            }

            if ((args[i] as SeleniumShadowRootWebElement).constructor === SeleniumShadowRootWebElement) {
                args[i] = await (args[i] as SeleniumShadowRootWebElement).evaluate('el => el.shadowRoot');
            }
        }

        return await this._driver.executeScript<R>(`return (${script})(...arguments)`, this._element, ...args);
    }

    override async selectByText(text: string): Promise<void> {
        // TODO:
        // this method is for selecting through the <select> element

        // as there is no method for this, JS must be performed
    }

    override async selectByIndex(index: number): Promise<void> {
        // TODO:
        // this method is for selecting through the <select> element

        // as there is no method for this, JS must be performed
    }

    override async selectByValue(value: string): Promise<void> {
        // TODO:
        // this method is for selecting through the <select> element

        // as there is no method for this, JS must be performed
    }

    override async isPresent(): Promise<boolean> {
        try {
            return await this._element.getId() != null;
        } catch {
            return false;
        }
    }

    override async isVisible(): Promise<boolean> {
        return await this._element.isDisplayed();
    }

    override async isClickable(): Promise<boolean> {
        return await this._element.isEnabled();
    }

    override async scrollIntoView(): Promise<void> {
        await this.evaluate('el => el.scrollIntoView(true);');
    }

    override async getShadowRoot(): Promise<WebElement | null> {
        try {
            const shadowRoot = await this._element.getShadowRoot();
            return new SeleniumShadowRootWebElement(this._element, this._driver, shadowRoot, true);
        } catch {
            return null;
        }
    }
}
