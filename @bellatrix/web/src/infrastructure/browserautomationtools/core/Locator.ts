type LocatorType = 'css' | 'xpath';

export class Locator {
    private _type: LocatorType;
    private _value: string;

    private constructor(type: LocatorType, value: string) {
        this._type = type;
        this._value = value;
    }

    static byCss(css: string, index: number) {
        return new Locator('css', index > 0 ? `${css}:nth-child(${index + 1})` : css);
    }

    static byXpath(xpath: string, index: number) {
        return new Locator('xpath', index > 0 ? `(${xpath})[${index + 1}]` : xpath);
    }

    get type(): LocatorType {
        return this._type;
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return `${this.type} = ${this.value}`;
    }
}
