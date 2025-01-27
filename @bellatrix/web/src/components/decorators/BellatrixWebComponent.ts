import { BrowserAutomationTool, SearchContext, WebElement } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ShadowRootContext, WebComponent } from '@bellatrix/web/components';
import { WebComponentListener } from '@bellatrix/web/components/utilities';
import { ServiceLocator } from '@bellatrix/core/utilities';

export function BellatrixWebComponent<TComponent extends typeof WebComponent<Element>>(target: TComponent) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype).filter(method => method !== 'constructor') as (keyof typeof target.prototype)[];

    originalMethods.forEach((method) => {
        if (typeof target.prototype[method] === 'function') {
            const originalMethod = target.prototype[method] as Function & { [Symbol.toStringTag]?: string };
            const isAsync = originalMethod[Symbol.toStringTag] === 'AsyncFunction';

            if (isAsync) {
                // @ts-expect-error - we know that the method is async therefore it can't be read-only property
                target.prototype[method] = async function (this: typeof target.prototype, ...args: never) {
                    const searchContext: SearchContext = this['_parentComponent'] ? await resolveParentElement(this['_parentComponent']) : ServiceLocator.resolve(BrowserAutomationTool);
                    this['_cachedElement'] ??= await searchContext.findElement(this.findStrategy.convert());

                    let retryCount = 10; // TODO: make it configuration controlled (do we need more than 1 retry even?)

                    const beforeMethodListeners = ServiceLocator.resolveAll(WebComponentListener, `before|${method}`);
                    for (const beforeMethodListener of beforeMethodListeners) {
                        if (beforeMethodListener.component !== this.constructor) {
                            continue;
                        }

                        await beforeMethodListener.method(this, ...args);
                    }

                    while (true) {
                        try {
                            const result = await originalMethod.apply(this, args);

                            const afterMethodListeners = ServiceLocator.resolveAll(WebComponentListener, `after|${method}`);
                            for (const afterMethodListener of afterMethodListeners) {
                                if (afterMethodListener.component !== this.constructor) {
                                    continue;
                                }

                                await afterMethodListener.method(this, ...args);
                            }

                            return result;
                        } catch (e) {
                            if (e instanceof Error && (e.name === 'StaleElementReferenceError' || e.name === 'TypeError') && --retryCount >= 0) {
                                this['_cachedElement'] = await searchContext.findElement(this.findStrategy.convert());
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

    const parentOfParentComponent = (parentComponent as WebComponent)['_parentComponent'];
    const searchContext: SearchContext = parentOfParentComponent ? await resolveParentElement(parentOfParentComponent as (WebComponent | ShadowRootContext)) : ServiceLocator.resolve(BrowserAutomationTool);
    (parentComponent as WebComponent)['_cachedElement'] ??= await searchContext.findElement((parentComponent as WebComponent)['_findStrategy'].convert());
    return parentComponent.wrappedElement;
}
