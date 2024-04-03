import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';

export abstract class FindStrategy {
    private _index: number = 0;
    abstract convert(): Locator;

    get index(): number {
        return this._index;
    }

    toString(): string {
        return this.convert().toString();
    }

    static interpolate(strings: TemplateStringsArray, values: any[]): string {
        const interpolatedValues = values.map((value, index) => `${value}${strings[index + 1]}`).join('');
        return `${strings[0]}${interpolatedValues}`;
    }
}