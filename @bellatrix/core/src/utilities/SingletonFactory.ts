import type { ParameterlessCtor } from "@bellatrix/core/types";

export class SingletonFactory {
    private static readonly instances: Map<string, object> = new Map();

    private constructor() { /* c8 ignore next */ throw new Error('ServiceLocator is static and cannot be instantiated') }

    static getInstance<T extends object>(classOf: ParameterlessCtor<T>): T {
        const className = classOf.name;
        if (!SingletonFactory.instances.has(className)) {
            const obj = new classOf() as T;
            SingletonFactory.instances.set(className, obj);
        }

        return SingletonFactory.instances.get(className) as T;
    }
}