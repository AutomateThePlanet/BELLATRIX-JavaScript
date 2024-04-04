import { WebElement as NativeWebElement, WebDriver as NativeWebDriver, until, By } from 'selenium-webdriver';

import { Locator, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';

import type { HtmlAttribute } from '@bellatrix/web/types';
import { BellatrixSettings } from '@bellatrix/core/settings';

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
        // await this._element.isDisplayed();
        // await this._driver.executeScript('arguments[0].click();', this._element); // js click
    }

    override async hover() {
        const actions = this._driver.actions();
        await actions
            .move({origin: this._element})
            .perform();
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

    override async isChecked(): Promise<boolean> {
        return await this._element.isSelected();
    }

    override async setChecked(checked: boolean): Promise<void> {
        if ((!checked && await this.isChecked()) || (checked && !(await this.isChecked()))) {
            await this._element.click();
        }
    }

    override async setInputFile(file: string): Promise<void> {
        return await this._element.sendKeys(file);
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
        return elements.map(element => new SeleniumWebElement(element, this._driver) /* TODO: handle error? */);
    }

    override async evaluate<R>(script: string | Function, ...args: any[]): Promise<R> {
        return await this._driver.executeScript<R>(`
            const tempArgs = Array.from(arguments);
            const element = tempArgs.shift();
            for (let i = 0; i < tempArgs.length; i++) {
                arguments[i] = tempArgs[i];
            }
            arguments.length = tempArgs.length;
            return (${script})(element);
        `, this._element, args);
        // TODO: needs testing
        // TODO: script to be the same between selenium and playwright
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
}