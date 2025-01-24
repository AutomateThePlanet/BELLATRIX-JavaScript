import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class NameFindStrategy extends FindStrategy {
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
    }

    override convert(): Locator {
        return Locator.byCss(`[name='${this._name}']`, this.index);
    }

    override toString(): string {
        return `name = ${this._name}`;
    }
}

export function name(strings: TemplateStringsArray, ...values: unknown[]): NameFindStrategy {
    const nameExpression = FindStrategy.interpolate(strings, values);
    return new NameFindStrategy(nameExpression);
}
