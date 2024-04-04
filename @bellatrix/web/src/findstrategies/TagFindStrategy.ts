import { Locator } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '.';

export class TagFindStrategy extends FindStrategy {
    private _tag: string;

    constructor(tag: string) {
        super();
        this._tag = tag;
    }

    override convert(): Locator {
        return Locator.byXpath(`//${this._tag}`, this.index);
    }

    override toString(): string {
        return `tag is <${this._tag}>`;
    }
}

export function tag(strings: TemplateStringsArray, ...values: any[]): TagFindStrategy {
    const tagExpression = FindStrategy.interpolate(strings, values);
    return new TagFindStrategy(tagExpression);
}