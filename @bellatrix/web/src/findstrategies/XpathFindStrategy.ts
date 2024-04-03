import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class XpathFindStrategy extends FindStrategy {
    private _xpath: string;

    constructor(xpath: string) {
        super();
        this._xpath = xpath;
    }

    override convert(): Locator {
        return Locator.byXpath(this._xpath, this.index);
    }
}

export function xpath(strings: TemplateStringsArray, ...values: any[]): XpathFindStrategy {
    const xpathExpression = FindStrategy.interpolate(strings, values);
    return new XpathFindStrategy(xpathExpression);
}