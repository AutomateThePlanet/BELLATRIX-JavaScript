import { Locator } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { FindStrategy } from '.';

export class CssFindStrategy extends FindStrategy {
    private _css: string;

    constructor(css: string) {
        super();
        this._css = css;
    }

    override convert(): Locator {
        return Locator.byCss(this._css, this.index);
    }
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): CssFindStrategy {
    const cssExpression = FindStrategy.interpolate(strings, values);
    return new CssFindStrategy(cssExpression);
}
