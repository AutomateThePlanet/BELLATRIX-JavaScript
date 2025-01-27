import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class LinkTextContainingFindStrategy extends FindStrategy {
    private _linkTextContaining: string;

    constructor(linkTextContaining: string) {
        super();
        this._linkTextContaining = linkTextContaining;
    }

    override convert(): Locator {
        // TODO: It may not work for relative finding in selenium, because for relative finding the xpath must start with './/'
        return Locator.byXpath(`//a[contains(normalize-space(), '${this._linkTextContaining}')]`, this.index);
    }

    override toString(): string {
        return `link text contains ${this._linkTextContaining}`;
    }
}

export function linkTextContaining(strings: TemplateStringsArray, ...values: unknown[]): LinkTextContainingFindStrategy {
    const linkTextExpression = FindStrategy.interpolate(strings, values);
    return new LinkTextContainingFindStrategy(linkTextExpression);
}
