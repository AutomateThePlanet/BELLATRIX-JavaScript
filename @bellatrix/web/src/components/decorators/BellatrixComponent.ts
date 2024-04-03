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
                    const startTime = Date.now();
                    let totalWaitTime = 10_000; // milliseconds // TODO: get from timeout
                    let retryCount = 0;
                    const driver = ServiceLocator.resolve(BrowserAutomationTool);
                    this._cachedElement ??= await driver.findElement(this._findStrategy.convert());
                    while (Date.now() - startTime < totalWaitTime) {
                        try {
                            retryCount++;
                            return await originalMethod.apply(this, args);
                        } catch {
                            this._cachedElement = await driver.findElement(this._findStrategy.convert());
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    }

                    throw new Error(`Waited for 10 second and timed out. Retried '${method}' ${retryCount} time${retryCount !== 1 ? 's' : ''}.`);
                };
            } // do we need to do something with non-async methods?
        }
    });

    return target;
}