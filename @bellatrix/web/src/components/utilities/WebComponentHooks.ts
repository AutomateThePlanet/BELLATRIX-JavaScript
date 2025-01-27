import type { Ctor } from '@bellatrix/core/types';
import { WebComponent } from '@bellatrix/web/components';
import { ServiceLocator } from '@bellatrix/core/utilities';

type AsyncMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer _P) => Promise<unknown> ? K : never;
}[keyof T];

export class WebComponentHooks {
    static addListenerTo<TComponent extends WebComponent>(component: Ctor<TComponent>) {
        return {
            before<Key extends AsyncMethods<TComponent>>(methodName: Key, method: (componentInstance: TComponent, ...args: Parameters<TComponent[Key] extends (...args: infer _P) => infer _R ? TComponent[Key] : never>) => unknown) {
                ServiceLocator.registerSingleton(WebComponentListener<TComponent>, new class extends WebComponentListener<TComponent> { }(component, method), `before|${String(methodName)}`);
            },
            after<Key extends AsyncMethods<TComponent>>(methodName: Key, method: (componentInstance: TComponent, ...args: Parameters<TComponent[Key] extends (...args: infer _P) => infer _R ? TComponent[Key] : never>) => unknown) {
                ServiceLocator.registerSingleton(WebComponentListener<TComponent>, new class extends WebComponentListener<TComponent> { }(component, method), `after|${String(methodName)}`);
            }
        };
    }
}

export abstract class WebComponentListener<TComponent extends WebComponent> {
    readonly component: Ctor<TComponent>;
    readonly method: (component: TComponent, ...args: never) => unknown;

    constructor(component: Ctor<TComponent>, method: <T>(component: TComponent, ...args: never) => unknown) {
        this.component = component;
        this.method = method;
    }
}
