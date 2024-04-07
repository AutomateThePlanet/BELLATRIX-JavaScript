import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class NameEndingWithFindStrategy extends FindStrategy {
    private _nameEnding: string;

    constructor(nameEnding: string) {
        super();
        this._nameEnding = nameEnding;
    }

    override convert(): Locator {
        return Locator.byCss(`[name$='${this._nameEnding}']`, this.index);
    }

    override toString(): string {
        return `name ending with ${this._nameEnding}`;
    }
}

export function nameEndingWith(strings: TemplateStringsArray, ...values: any[]): NameEndingWithFindStrategy {
    const nameExpression = FindStrategy.interpolate(strings, values);
    return new NameEndingWithFindStrategy(nameExpression);
}