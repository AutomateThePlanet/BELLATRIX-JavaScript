import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class ClassContainingFindStrategy extends FindStrategy {
    private _classContaining: string;

    constructor(classContaining: string) {
        super();

        if (/.*\s.*/.test(classContaining)) {
            throw Error('Compound class names not permitted');
        }

        this._classContaining = classContaining;
    }

    override convert(): Locator {
        return Locator.byCss(`[class*='${this._classContaining}']`, this.index);
    }
}

export function classContaining(strings: TemplateStringsArray, ...values: any[]): ClassContainingFindStrategy {
    const classExpression = FindStrategy.interpolate(strings, values);
    return new ClassContainingFindStrategy(classExpression);
}