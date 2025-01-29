import { BrowserController, WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { Validator, StringValidator, NumberValidator, UnknownValidator, BooleanValidator } from '@bellatrix/web/validators';
import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { FindStrategy } from '@bellatrix/web/findstrategies';
import { ComponentService, ComponentWaitService } from '@bellatrix/web/services';
import { ShadowRootContext } from '.';

import type { Ctor, MethodNamesStartingWith } from '@bellatrix/core/types';
import type { HtmlAttribute } from '@bellatrix/web/types';

@BellatrixWebComponent
export class WebComponent<HTMLType extends HTMLElement = HTMLElement> {
    private _cachedElement!: WebElement;
    private _wait: ComponentWaitService;
    private _findStrategy: FindStrategy;
    private _driver: BrowserController;
    private _parentComponent?: WebComponent | ShadowRootContext;
    private _componentName?: string;

    constructor(findStrategy: FindStrategy, driver: BrowserController, parentComponent?: WebComponent | ShadowRootContext, cachedElement?: WebElement, componentName?: string) {
        this._findStrategy = findStrategy;
        this._driver = driver;
        this._parentComponent = parentComponent;
        this._cachedElement = cachedElement!;
        this._componentName = componentName;
        this._wait = new ComponentWaitService(driver, this);
    };

    get wrappedElement(): WebElement {
        return this._cachedElement;
    }

    get findStrategy(): FindStrategy {
        return this._findStrategy;
    }

    get wait(): ComponentWaitService {
        return this._wait;
    }

    get componentName(): string {
        return this._componentName ?? `${this.constructor.name} (${this.findStrategy})`;
    }

    as<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>): T {
        return new type(this._findStrategy, this._driver);
    }

    async hover(): Promise<void> {
        await this.wrappedElement.hover();
    }

    async focus(): Promise<void> {
        await this.wrappedElement.focus();
    }

    async getAttribute(name: HtmlAttribute): Promise<string> {
        return await this.wrappedElement.getAttribute(name);
    }

    async isPresent(): Promise<boolean> {
        return await this.wrappedElement.isPresent();
    }

    async isVisible(): Promise<boolean> {
        return await this.wrappedElement.isVisible();
    }

    async isClickable(): Promise<boolean> {
        return await this.wrappedElement.isClickable();
    }

    async scrollIntoView(): Promise<void> {
        return await this.wrappedElement.scrollIntoView();
    }

    async getOuterHtml(): Promise<string> {
        return await this.wrappedElement.getOuterHtml();
    }

    validate<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'get'> extends string ? keyof MethodNamesStartingWith<this, 'get'> : never>, K extends `get${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never>)
        : Awaited<ReturnType<this[K] extends (...args: infer _A) => infer _R ? this[K] : never>> extends string ? StringValidator
        : Awaited<ReturnType<this[K] extends (...args: infer _A) => infer _R ? this[K] : never>> extends number ? NumberValidator
        : Awaited<ReturnType<this[K] extends (...args: infer _A) => infer _R ? this[K] : never>> extends boolean ? BooleanValidator
        : UnknownValidator
    {
        return new Validator((this[`get${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as unknown[]), attribute);
    }

    async validateIs<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'is'> extends string ? keyof MethodNamesStartingWith<this, 'is'> : never>, K extends `is${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never>) : Promise<void>
    {
        await new Validator((this[`is${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as unknown[]), attribute).isTrue();
    }

    async validateIsNot<T extends Uncapitalize<keyof MethodNamesStartingWith<this, 'is'> extends string ? keyof MethodNamesStartingWith<this, 'is'> : never>, K extends `is${Capitalize<T extends string ? T : never>}` & keyof this>(attribute: T & string, ...args: Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never> extends never ? [] : Parameters<this[K] extends () => infer _R ? never : this[K] extends (...args: infer _A) => infer _R ? this[K] : never>) : Promise<void>
    {
        await new Validator((this[`is${attribute.charAt(0).toUpperCase() + attribute.slice(1)}` as keyof this] as Function).bind(this, ...args as unknown[]), attribute).isFalse();
    }

    async evaluate<R, VarArgs extends unknown[] = []>(script: (element: HTMLType, ...args: { [K in keyof VarArgs]: VarArgs[K] extends WebComponent<infer T> ? T : VarArgs[K] }) => R, ...args: VarArgs) : Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof WebComponent) {
                await (args[i] as WebComponent).wait.toExist();
                args[i] = (args[i] as WebComponent).wrappedElement;
            }
        }

        return await this.wrappedElement.evaluate(script, ...args) as R;
    }

    async getShadowRoot(): Promise<ShadowRootContext> {
        const shadowRoot = await this.wrappedElement.getShadowRoot();

        if (!shadowRoot) {
            throw Error('Shadow root not found.');
        }

        return new ShadowRootContext(this._driver, this, shadowRoot);
    }

    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>): ComponentService<T> {
        return new ComponentService(this._driver, type, this);
    }
}
