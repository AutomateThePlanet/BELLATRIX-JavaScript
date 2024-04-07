import { BrowserAutomationTool, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { Validator, StringValidator, NumberValidator, UnknownValidator, BooleanValidator } from '@bellatrix/web/validators';
import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { FindStrategy } from '@bellatrix/web/findstrategies';
import { ComponentService } from '@bellatrix/web/services';

import type { Ctor, MethodNamesStartingWith } from '@bellatrix/core/types';
import type { HtmlAttribute } from '@bellatrix/web/types';

@BellatrixComponent
export class WebComponent {
    private _cachedElement!: WebElement;

    constructor(private _findStrategy: FindStrategy, private _driver: BrowserAutomationTool, private _parentElement?: WebElement, cachedElement?: WebElement) {
        this._cachedElement = cachedElement!;
    };

    get wrappedElement(): WebElement {
        return this._cachedElement;
    }

    get findStrategy(): FindStrategy {
        return this._findStrategy;
    }

    as<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>): T {
        return new type(this._findStrategy, this._driver);
    }

    async hover(): Promise<void> {
        await this.wrappedElement.hover();
    }

    async getAttribute(name: HtmlAttribute): Promise<string> {
        return await this.wrappedElement.getAttribute(name);
    }

    async isVisible(): Promise<boolean> {
        return false;
        // TODO
    }

    validate<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'get'> extends string ? keyof MethodNamesStartingWith<this, 'get'> : never>, K extends `get${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never>)
        : Awaited<ReturnType<this[K] extends (...args: any) => any ? this[K] : never>> extends string ? StringValidator
        : Awaited<ReturnType<this[K] extends (...args: any) => any ? this[K] : never>> extends number ? NumberValidator
        : Awaited<ReturnType<this[K] extends (...args: any) => any ? this[K] : never>> extends boolean ? BooleanValidator
        : UnknownValidator
    {
        return new Validator((this[`get${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as any[]), attribute);
    }

    async validateIs<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'is'> extends string ? keyof MethodNamesStartingWith<this, 'is'> : never>, K extends `is${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never>) : Promise<void>
    {
        await new Validator((this[`is${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as any[]), attribute).isTrue();
    }

    async validateIsNot<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'is'> extends string ? keyof MethodNamesStartingWith<this, 'is'> : never>, K extends `is${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => any ? never : this[K] extends (...args: any) => any ? this[K] : never>) : Promise<void>
    {
        await new Validator((this[`is${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as any[]), attribute).isFalse();
    }

    async evaluate<R>(script: string | Function, ...args: any[]) : Promise<R> {
        return await this.wrappedElement.evaluate(script, args) as R;
    }

    // TODO: Remove
    protected async defaultSetValue(value: string | number | boolean): Promise<string> {
        return await this.wrappedElement.evaluate(`el => el.value = "${value}"`);
    }

    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(this._driver, type, this.wrappedElement);
    }
}