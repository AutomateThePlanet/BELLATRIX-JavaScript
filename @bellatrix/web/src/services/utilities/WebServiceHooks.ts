import type { Ctor } from '@bellatrix/core/types';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { WebService } from '@bellatrix/web/services';

type NonAsyncMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer _P) => Promise<infer _R> ? never : K;
}[keyof T];

type AsyncMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer _P) => Promise<infer _R> ? K : never;
}[keyof T];

type Methods<T> = NonAsyncMethods<T> | AsyncMethods<T>

export class WebServiceHooks {
    static addListenerTo<TService extends WebService>(service: Ctor<TService>) {
        return new class {
            before<Key extends NonAsyncMethods<TService>, R = void>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => R extends Promise<unknown> ? never : R): void;
            before<Key extends AsyncMethods<TService>>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void | Promise<void>): void;
            before<Key extends Methods<TService>>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void): void {
                ServiceLocator.registerSingleton(WebServiceListener<TService>, new class extends WebServiceListener<TService> { }(service, method), `before|${String(methodName)}`);
            }

            after<Key extends NonAsyncMethods<TService>, R = void>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => R extends Promise<unknown> ? never : R): void;
            after<Key extends AsyncMethods<TService>>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void | Promise<void>): void;
            after<Key extends Methods<TService>>(methodName: Key, method: (this: TService, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void): void {
                ServiceLocator.registerSingleton(WebServiceListener<TService>, new class extends WebServiceListener<TService> { }(service, method), `after|${String(methodName)}`);
            }

            onError<Key extends NonAsyncMethods<TService>, R = void>(methodName: Key, method: (this: TService, error?: Error, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => R extends Promise<unknown> ? never : R): void;
            onError<Key extends AsyncMethods<TService>>(methodName: Key, method: (this: TService, error?: Error, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void | Promise<void>): void;
            onError<Key extends Methods<TService>>(methodName: Key, method: (this: TService, error?: Error, ...args: Parameters<TService[Key] extends (...args: infer _P) => infer _R ? TService[Key] : never>) => void): void {
                ServiceLocator.registerSingleton(WebServiceListener<TService>, new class extends WebServiceListener<TService> { }(service, method), `onError|${String(methodName)}`);
            }
        };
    }
}

export abstract class WebServiceListener<TService extends WebService> {
    readonly service: Ctor<TService>;
    readonly method: (...args: never) => unknown;

    constructor(service: Ctor<TService>, method: (this: TService, ...args: never) => unknown) {
        this.service = service;
        this.method = method;
    }
}
