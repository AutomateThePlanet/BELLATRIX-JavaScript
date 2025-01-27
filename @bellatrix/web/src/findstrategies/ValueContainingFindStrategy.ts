import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class ValueContainingFindStrategy extends FindStrategy {
    private _valueContaining: string;

    constructor(valueContaining: string) {
        super();
        this._valueContaining = valueContaining;
    }
    override convert(): Locator {
        return Locator.byCss(`[value*='${this._valueContaining}']`, this.index);
    }

    override toString(): string {
        return `value containing ${this._valueContaining}`;
    }
}

export function valueContaining(strings: TemplateStringsArray, ...values: unknown[]): ValueContainingFindStrategy {
    const valueExpression = FindStrategy.interpolate(strings, values);
    return new ValueContainingFindStrategy(valueExpression);
}
