import { BrowserController, SearchContext, WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { ShadowRootContext, WebComponent } from '@bellatrix/web/components';
import { WebComponentListener } from '@bellatrix/web/components/utilities';
import { resolveAll, resolve } from '@bellatrix/core/utilities';
import { Ctor } from '@bellatrix/core/types';

export function BellatrixWebComponent<
    This extends WebComponent<HTMLElement>,
    TComponent extends Ctor<This> = Ctor<This, ConstructorParameters<typeof WebComponent<HTMLElement>>>
>(target: TComponent, _context: ClassDecoratorContext<TComponent>): TComponent {
    const originalMethods = Object.getOwnPropertyNames(target.prototype).filter(method => method !== 'constructor') as (keyof typeof target.prototype)[];

    originalMethods.forEach((method) => {
        if (typeof target.prototype[method] === 'function') {
            const originalMethod = target.prototype[method] as Function & { [Symbol.toStringTag]?: string };
            const isAsync = originalMethod[Symbol.toStringTag] === 'AsyncFunction';

            if (isAsync) {
                target.prototype[method] = async function (this: typeof target.prototype, ...args: never) {
                    const searchContext: SearchContext = this['_parentComponent'] ? await resolveParentElement(this['_parentComponent']) : resolve(BrowserController);
                    this['_cachedElement'] ??= await searchContext.findElement(this.findStrategy.convert());

                    const beforeMethodListeners = resolveAll(WebComponentListener, `before|${String(method)}`);
                    for (const beforeMethodListener of beforeMethodListeners) {
                        if (beforeMethodListener.component !== this.constructor) {
                            continue;
                        }

                        await beforeMethodListener.method.apply(this, args);
                    }

                    let hasRetried = false;
                    while (true) {
                        try {
                            const result = await originalMethod.apply(this, args);

                            const afterMethodListeners = resolveAll(WebComponentListener, `after|${String(method)}`);
                            for (const afterMethodListener of afterMethodListeners) {
                                if (afterMethodListener.component !== this.constructor) {
                                    continue;
                                }

                                await afterMethodListener.method.apply(this, args);
                            }

                            return result;
                        } catch (e) {
                            if (e instanceof Error && (e.name === 'StaleElementReferenceError') && !hasRetried) {
                                this['_cachedElement'] = await searchContext.findElement(this.findStrategy.convert());
                                hasRetried = true;
                                continue;
                            }

                            const onErrorMethodListeners = resolveAll(WebComponentListener, `onError|${String(method)}`);
                            for (const onErrorMethodListener of onErrorMethodListeners) {
                                if (onErrorMethodListener.component !== this.constructor) {
                                    continue;
                                }

                                await onErrorMethodListener.method.apply(this, [e, ...args] as never);
                            }

                            throw e;
                        }
                    }
                };
            }
        }
    });

    return target;
}

export async function resolveParentElement(parentComponent: WebComponent | ShadowRootContext): Promise<WebElement> {
    if (parentComponent.wrappedElement) {
        return parentComponent.wrappedElement;
    }

    const parentOfParentComponent = (parentComponent as WebComponent)['_parentComponent'];
    const searchContext: SearchContext = parentOfParentComponent ? await resolveParentElement(parentOfParentComponent as (WebComponent | ShadowRootContext)) : resolve(BrowserController);
    (parentComponent as WebComponent)['_cachedElement'] ??= await searchContext.findElement((parentComponent as WebComponent)['_findStrategy'].convert());
    return parentComponent.wrappedElement;
}
