import { Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { FindStrategy } from '.';

export class AttributeFindStrategy extends FindStrategy {
    private _value: string;
    private _attribute: string;

    constructor(attribute: string, valueContaining: string) {
        super();
        this._value = valueContaining;
        this._attribute = attribute;
    }
    override convert(): Locator {
        return Locator.byCss(`[${this._attribute}='${this._value}']`, this.index);
    }

    override toString(): string {
        return `${this._attribute} = ${this._value}`;
    }
}
