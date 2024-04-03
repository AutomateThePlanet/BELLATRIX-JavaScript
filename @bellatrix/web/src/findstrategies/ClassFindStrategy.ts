import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class ClassFindStrategy extends FindStrategy {
    private _class: string;

    constructor(className: string) {
        super();

        if (/.*\s.*/.test(className)) {
            throw Error('Compound class names not permitted');
        }

        this._class = className;
    }

    override convert(): Locator {
        return Locator.byCss(`.${this._class}`, this.index);
    }
}

export function className(strings: TemplateStringsArray, ...values: any[]): ClassFindStrategy {
    const classExpression = FindStrategy.interpolate(strings, values);
    return new ClassFindStrategy(classExpression);
}