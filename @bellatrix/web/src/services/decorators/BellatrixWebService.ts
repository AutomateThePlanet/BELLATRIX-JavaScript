import { ServiceLocator } from '@bellatrix/core/utilities';
import { WebService } from '@bellatrix/web/services';
import { WebServiceListener } from '@bellatrix/web/services/utilities';

import type { AbstractCtor } from '@bellatrix/core/types';

export function BellatrixWebService<TService extends AbstractCtor<WebService>>(target: TService) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype).filter(method => method !== 'constructor') as (keyof typeof target.prototype & string)[];

    originalMethods.forEach((method) => {
        if (typeof target.prototype[method] === 'function') {
            const originalMethod = target.prototype[method] as Function & { [Symbol.toStringTag]?: string };
            const isAsync = originalMethod[Symbol.toStringTag] === 'AsyncFunction';

            if (isAsync) {
                target.prototype[method] = async function (this: typeof target.prototype, ...args: never) {
                    const beforeMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `before|${method}`);
                    for (const beforeMethodListener of beforeMethodListeners) {
                        if (beforeMethodListener.service !== this.constructor) {
                            continue;
                        }

                        await beforeMethodListener.method(this, ...args);
                    }

                    let result;
                    try {
                        result = await originalMethod.apply(this, args);
                    } catch (e) {
                        const beforeMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `onError|${method}`);
                        for (const beforeMethodListener of beforeMethodListeners) {
                            if (beforeMethodListener.service !== this.constructor) {
                                continue;
                            }

                            await beforeMethodListener.method(this, e, ...args);
                        }

                        throw e;
                    }

                    const afterMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `after|${method}`);
                    for (const afterMethodListener of afterMethodListeners) {
                        if (afterMethodListener.service !== this.constructor) {
                            continue;
                        }

                        await afterMethodListener.method(this, ...args);
                    }

                    return result;
                };
            } else {
                target.prototype[method] = function (this: typeof target.prototype, ...args: never) {
                    const beforeMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `before|${method}`);
                    for (const beforeMethodListener of beforeMethodListeners) {
                        if (beforeMethodListener.service !== this.constructor) {
                            continue;
                        }

                        beforeMethodListener.method(this, ...args);
                    }

                    let result;
                    try {
                        result = originalMethod.apply(this, args);
                    } catch (e) {
                        const beforeMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `onError|${method}`);
                        for (const beforeMethodListener of beforeMethodListeners) {
                            if (beforeMethodListener.service !== this.constructor) {
                                continue;
                            }

                            beforeMethodListener.method(this, e, ...args);
                        }

                        throw e;
                    }

                    const afterMethodListeners = ServiceLocator.resolveAll(WebServiceListener, `after|${method}`);
                    for (const afterMethodListener of afterMethodListeners) {
                        if (afterMethodListener.service !== this.constructor) {
                            continue;
                        }

                        afterMethodListener.method(this, ...args);
                    }

                    return result;
                };
            }
        }
    });
}
