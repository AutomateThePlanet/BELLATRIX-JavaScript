import { Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { FindStrategy } from '.';

export class IdFindStrategy extends FindStrategy {
    private _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    override convert(): Locator {
        return Locator.byCss(`#${this._id}`, this.index);
    }

    override toString(): string {
        return `id = ${this._id}`;
    }
}

export function id(strings: TemplateStringsArray, ...values: unknown[]): IdFindStrategy {
    const idExpression = FindStrategy.interpolate(strings, values);
    return new IdFindStrategy(idExpression);
}
