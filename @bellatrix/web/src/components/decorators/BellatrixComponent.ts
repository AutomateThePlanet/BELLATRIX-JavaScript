import { BrowserAutomationTool, SearchContext, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ShadowRootContext, WebComponent } from '@bellatrix/web/components';
import { ServiceLocator } from '@bellatrix/core/utilities';

export function BellatrixComponent(target: any) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype);

    originalMethods.forEach((method: string) => {
        if (method !== 'constructor' && typeof target.prototype[method] === 'function') {
            const originalMethod = target.prototype[method];
            const isAsync = originalMethod[Symbol.toStringTag] === 'AsyncFunction';

            if (isAsync) {
                target.prototype[method] = async function (...args: any[]) {
                    const searchContext: SearchContext = this._parentComponent ? await resolveParentElement(this._parentComponent) : ServiceLocator.resolve(BrowserAutomationTool);
                    this._cachedElement ??= await searchContext.findElement(this._findStrategy.convert());

                    let retryCount = 10;
                    // TODO: beforemethod plugins
                    while (true) {
                        try {
                            const result = await originalMethod.apply(this, args);
                            // TODO: aftermethod plugins
                            return result;
                        } catch (e) {
                            if (e instanceof Error && (e.name === 'StaleElementReferenceError' || e.name === 'TypeError') && --retryCount >= 0) {
                                this._cachedElement = await searchContext.findElement(this._findStrategy.convert());
                                continue;
                            }

                            throw e;
                        }
                    }
                };
            } // do we need to do something with non-async methods?
        }
    });

    return target;
}

export async function resolveParentElement(parentComponent: WebComponent | ShadowRootContext): Promise<WebElement> {
    if (parentComponent.wrappedElement) {
        return parentComponent.wrappedElement;
    }

    const parentOfParentComponent = (parentComponent as WebComponent)['_parentComponent']
    const searchContext: SearchContext = parentOfParentComponent ? await resolveParentElement(parentOfParentComponent as (WebComponent | ShadowRootContext)) : ServiceLocator.resolve(BrowserAutomationTool);
    (parentComponent as WebComponent)['_cachedElement'] ??= await searchContext.findElement((parentComponent as WebComponent)['_findStrategy'].convert());
    return parentComponent.wrappedElement;
}