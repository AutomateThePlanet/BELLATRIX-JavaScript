import { Locator as NativeLocator } from '@playwright/test';

import { PlaywrightWebElement } from ".";
import { Locator, WebElement } from "../core";
import { BellatrixSettings } from '@bellatrix/core/settings';
import { Utilities } from '@bellatrix/core/utilities';

export class PlaywrightShadowRootWebElement extends PlaywrightWebElement {
    constructor(webElement: PlaywrightWebElement) {
        super(webElement['_locator']);
    }
    
    override async findElement(locator: Locator): Promise<WebElement> {
        let nativeLocator: NativeLocator;
        switch (locator.type) {
            case 'css':
                nativeLocator = this._locator.locator(`css=${locator.value}`).first();
                break;
            case 'xpath':
                const cssLocators = this.relativeXpathToAbsoluteCss(await this._locator.innerHTML(), locator.value);
                nativeLocator = this._locator.locator(`css=${cssLocators[0]}`).first();
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        try {
            nativeLocator.waitFor({ timeout: BellatrixSettings.get().webSettings.timeoutSettings.findElementTimeout });
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
                const cssLocators = this.relativeXpathToAbsoluteCss(await this._locator.innerHTML(), locator.value);
                nativeLocators = cssLocators.map(cssLocator => this._locator.locator(`css=${cssLocator}`).first());
                break;
            default:
                throw new Error(`Invalid locator type: ${locator.type}`);
        }

        return nativeLocators.map(locator => new PlaywrightWebElement(locator));
    }

    private relativeXpathToAbsoluteCss(htmlSoruce: string, xpath: string): string[] {
        const absoluteXpaths = Utilities.relativeToAbsoluteXpath(htmlSoruce, xpath);

        return absoluteXpaths.map(absoluteXpath => {
            const cssSelector = absoluteXpath.split('/').filter(Boolean).map(currentXpath => {
                return currentXpath.replace(/(\w+)(\[\d+\])?/g, (_, tagName, index) => {
                    return `${tagName}:nth-child(${index?.slice(1, -1)})`;
                })
            });

            return cssSelector.join(' > ');
        })
    }
}