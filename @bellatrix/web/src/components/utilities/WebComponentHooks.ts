import type { Ctor } from '@bellatrix/core/types';
import { WebComponent } from '@bellatrix/web/components';
import { ServiceLocator } from '@bellatrix/core/utilities';

type ExtractAsyncMethods<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? K : never;
}[keyof T];

type AsyncHook<T extends WebComponent> = {
    [K in ExtractAsyncMethods<T>]: K extends ExtractAsyncMethods<T>
      ? `${K & string}`
      : never;
}[ExtractAsyncMethods<T>];

export class WebComponentHooks {
    static addListenerTo<T extends WebComponent>(component: Ctor<T>) {
        return {
            before(methodName: AsyncHook<T>, method: (componentInstance: T) => (void | Promise<void>)) {
                ServiceLocator.registerSingleton(WebComponentListener<T>, new class extends WebComponentListener<T> {} (component, method), `before|${methodName}`)
            },
            after(methodName: AsyncHook<T>, method: (componentInstance: T) => (void | Promise<void>)) {
                ServiceLocator.registerSingleton(WebComponentListener<T>, new class extends WebComponentListener<T> {} (component, method), `after|${methodName}`)
            }
        }
    }
}

export abstract class WebComponentListener<T extends WebComponent> {
    readonly component: Ctor<T>;
    readonly method: (component: T) => (void | Promise<void>);

    constructor(component: Ctor<T>, method: (component: T) => (void | Promise<void>)) {
        this.component = component;
        this.method = method;
    }
}