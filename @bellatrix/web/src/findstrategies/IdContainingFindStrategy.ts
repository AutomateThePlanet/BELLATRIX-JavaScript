import { Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { FindStrategy } from '.';

export class IdContainingFindStrategy extends FindStrategy {
    private _idContaining: string;

    constructor(idContaining: string) {
        super();
        this._idContaining = idContaining;
    }
    override convert(): Locator {
        return Locator.byCss(`[id*='${this._idContaining}']`, this.index);
    }

    override toString(): string {
        return `id containing ${this._idContaining}`;
    }
}

export function idContaining(strings: TemplateStringsArray, ...values: unknown[]): IdContainingFindStrategy {
    const idExpression = FindStrategy.interpolate(strings, values);
    return new IdContainingFindStrategy(idExpression);
}
