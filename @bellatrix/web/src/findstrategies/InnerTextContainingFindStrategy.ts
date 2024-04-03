import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class InnerTextContainingFindStrategy extends FindStrategy {
    private _text: string;

    constructor(text: string) {
        super();
        this._text = text;
    }

    override convert(): Locator {
        return Locator.byXpath(`//*[contains(text(), '${this._text}')]']`, this.index);
    }

    override toString(): string {
        return `inner text containing ${this._text}`;
    }
}

export function innerTextContaining(strings: TemplateStringsArray, ...values: any[]): InnerTextContainingFindStrategy {
    const innerTextContainingExpression = FindStrategy.interpolate(strings, values);
    return new InnerTextContainingFindStrategy(innerTextContainingExpression);
}