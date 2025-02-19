import { Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { FindStrategy } from '.';

export class IdEndingWithFindStrategy extends FindStrategy {
    private _idEnding: string;

    constructor(idEnding: string) {
        super();
        this._idEnding = idEnding;
    }
    override convert(): Locator {
        return Locator.byCss(`[id$='${this._idEnding}']`, this.index);
    }

    override toString(): string {
        return `id ending with ${this._idEnding}`;
    }
}

export function idEndingWith(strings: TemplateStringsArray, ...values: unknown[]): IdEndingWithFindStrategy {
    const idExpression = FindStrategy.interpolate(strings, values);
    return new IdEndingWithFindStrategy(idExpression);
}
