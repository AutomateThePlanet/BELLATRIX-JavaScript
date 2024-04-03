import { WebElement as NativeWebElement, WebDriver as NativeWebDriver } from 'selenium-webdriver';

import { WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';

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
        return (await this._element.getAttribute('checked')).toLowerCase() === 'true';
    }

    override async setChecked(checked: boolean): Promise<void> {
        if ((!checked && await this.isChecked()) || (checked && !(await this.isChecked()))) {
            await this._element.click();
        }
    }
}