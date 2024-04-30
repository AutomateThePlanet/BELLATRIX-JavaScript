import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ServiceLocator } from '@bellatrix/core/utilities';

export function BellatrixComponent(target: any) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype);

    originalMethods.forEach((method: string) => {
        if (method !== 'constructor' && typeof target.prototype[method] === 'function') {
            const originalMethod = target.prototype[method];
            const isAsync = originalMethod[Symbol.toStringTag] === 'AsyncFunction';

            if (isAsync) {
                target.prototype[method] = async function (...args: any[]) {
                    const searchContext = this._parentElement ?? ServiceLocator.resolve(BrowserAutomationTool);
                    this._cachedElement ??= await searchContext.findElement(this._findStrategy.convert());

                    let retryCount = 10;
                    while (true) {
                        try {
                            const result = await originalMethod.apply(this, args);
                            // TODO: aftermethod plugins
                            return result;
                        } catch (e) {
                            if (e instanceof Error && e.name === 'StaleElementReferenceError' && --retryCount >= 0) {
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