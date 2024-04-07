import { BrowserAutomationTool, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { FindStrategy } from '@bellatrix/web/findstrategies';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { WebComponent } from '.';

import type { Ctor } from '@bellatrix/core/types';

export class ComponentsList<T extends WebComponent> {
    private _cachedComponents?: T[];
    private _foundAll: boolean = false;

    constructor(private _type: Ctor<T, ConstructorParameters<typeof WebComponent>>, private _findStrategy: FindStrategy, private _driver: BrowserAutomationTool, private _parentElement?: WebElement) {
    };

    async count(): Promise<number> {
        const components = await this.get();
        return components.length;
    }

    async get(): Promise<T[]>;
    async get(index: number): Promise<T>;
    async get(index?: number): Promise<T | T[]> {
        if (index === undefined && !this._foundAll) {
            const elements = await ServiceLocator.resolve(BrowserAutomationTool).findElements(this._findStrategy.convert());
            const components = elements.map((element, index) => {
                const findStrategy = this.cloneFindStrategyWithUpdatedIndex(this._findStrategy, index);
                const component = new this._type(findStrategy, this._driver, this._parentElement, element);

                return component;
            })

            this._cachedComponents = components;
            this._foundAll = true;
        }

        if (index !== undefined) {
            const findStrategy = this.cloneFindStrategyWithUpdatedIndex(this._findStrategy, index);
            const component = new this._type(findStrategy, this._driver);
            this._cachedComponents ??= [];
            this._cachedComponents[index] ??= component;
            return this._cachedComponents[index];
        }

        return this._cachedComponents!;
    }

    get findStrategy(): FindStrategy {
        return this._findStrategy;
    }

    private cloneFindStrategyWithUpdatedIndex<T extends FindStrategy>(findStrategy: T, index: number): T {
        return Object.assign(Object.create(Object.getPrototypeOf(findStrategy)), findStrategy, { _index: index});
    }
}