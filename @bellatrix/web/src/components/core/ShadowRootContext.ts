import { BrowserAutomationTool, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ComponentService } from '@bellatrix/web/services';

import type { Ctor } from '@bellatrix/core/types';
import { WebComponent } from '.';

export class ShadowRootContext<DOMType extends ShadowRoot = ShadowRoot> {
    private _cachedElement: WebElement;
    private _driver: BrowserAutomationTool;
    private _parentElement: WebElement;

    constructor(driver: BrowserAutomationTool, parentElement: WebElement, cachedElement: WebElement) {
        this._driver = driver;
        this._parentElement = parentElement;
        this._cachedElement = cachedElement;
    };

    get wrappedElement(): WebElement {
        return this._cachedElement;
    }

    async getInnerHtml(): Promise<string> {
        return await this.evaluate(el => el.innerHTML);
    }

    async evaluate<R, VarArgs extends any[] = []>(script: (element: DOMType, ...args: { [K in keyof VarArgs]: VarArgs[K] extends WebComponent<infer T> ? T : VarArgs[K] }) => R, ...args: VarArgs) : Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof WebComponent) {
                args[i] = (args[i] as WebComponent).wrappedElement;
            }
        }

        return await this.wrappedElement.evaluate(script, ...args) as R;
    }

    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(this._driver, type, this.wrappedElement);
    }
}
