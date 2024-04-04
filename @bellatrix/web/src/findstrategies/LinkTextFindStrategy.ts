import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class LinkTextFindStrategy extends FindStrategy {
    private _linkText: string;

    constructor(linkText: string) {
        super();
        this._linkText = linkText;
    }

    override convert(): Locator {
        return Locator.byXpath(`//a[normalize-space()='${this._linkText}']`, this.index);
    }

    override toString(): string {
        return `link text is ${this._linkText}`;
    }
}

export function linkText(strings: TemplateStringsArray, ...values: any[]): LinkTextFindStrategy {
    const linkTextExpression = FindStrategy.interpolate(strings, values);
    return new LinkTextFindStrategy(linkTextExpression);
}