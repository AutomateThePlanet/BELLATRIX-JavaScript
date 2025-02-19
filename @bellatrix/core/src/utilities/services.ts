import { isConstructor } from '.';

import type { AbstractCtor, Ctor, ParameterlessCtor, ServiceRegistration, TypeRegistration } from '@bellatrix/core/types';
import { Internal } from '../test/_common';

export abstract class ServiceLocatorError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ServiceLocatorUnregisterError extends ServiceLocatorError {
    constructor(type: string, name?: string);
    constructor(type: null, name: string);
    constructor(type: string | null, name?: string) {
        const serviceType = type ? ` of type ${type}` : '';
        const serviceName = name ? ` under the ${name} name` : '';
        super(`Registration${serviceType}${serviceName} is not currently registered.`);
        this.name = this.constructor.name;
    }
}

export class ServiceLocatorRegistrationError extends ServiceLocatorError {
    constructor(type: string, registrationType: string, name?: string) {
        const serviceName = name ? ` under the ${name} name` : '';
        super(`Registration of type ${type}${serviceName} is already registered as ${registrationType === 'singleton' ? 'transient' : 'singleton'} and cannot be reregistered as ${registrationType}. Unregister it first.`);
        this.name = this.constructor.name;
    }
}

export class ServiceLocatorResolutionError extends ServiceLocatorError {
    constructor(type: string, name?: string) {
        const serviceName = name ? ` under the ${name} name` : '';
        super(`No registration of type ${type} was found${serviceName} in the services locator.`);
        this.name = this.constructor.name;
    }
}

type GlobalStore = {
    [Internal.singletons]: Map<string, object>,
    [Internal.services]: Map<string, ServiceRegistration<unknown>>,
    [Internal.namedServices]: Map<string, ServiceRegistration<unknown>>,
    [Internal.types]: Map<string, TypeRegistration<unknown>>,
    [Internal.namedTypes]: Map<string, TypeRegistration<unknown>>,
} & typeof globalThis;

(globalThis as GlobalStore)[Internal.singletons] ??= new Map();
(globalThis as GlobalStore)[Internal.services] ??= new Map();
(globalThis as GlobalStore)[Internal.namedServices] ??= new Map();
(globalThis as GlobalStore)[Internal.types] ??= new Map();
(globalThis as GlobalStore)[Internal.namedTypes] ??= new Map();

const getSingletons: () => Map<string, object> = () => (globalThis as GlobalStore)[Internal.singletons];
const getServices: () => Map<string, ServiceRegistration<unknown>> = () => (globalThis as GlobalStore)[Internal.services];
const getNamedServices: () => Map<string, ServiceRegistration<unknown>> = () => (globalThis as GlobalStore)[Internal.namedServices];
const getTypes: () => Map<string, TypeRegistration<unknown>> = () => (globalThis as GlobalStore)[Internal.types];
const getNamedTypes: () => Map<string, TypeRegistration<unknown>> = () => (globalThis as GlobalStore)[Internal.namedTypes];

export function resolve<T>(type: AbstractCtor<T>, name?: string): T {
    const serviceRegistration = resolveInternal(type, name);
    const services = serviceRegistration.services;
    return serviceRegistration.isSingleton ? services[services.length - 1] as T : new (services[services.length - 1] as ParameterlessCtor<T>);
}

export function tryResolve<T>(type: AbstractCtor<T>, name?: string): T | null {
    try {
        const serviceRegistration = resolveInternal(type, name);
        const services = serviceRegistration.services;
        return serviceRegistration.isSingleton ? services[services.length - 1] as T : new (services[services.length - 1] as ParameterlessCtor<T>);
    } catch {
        return null;
    }
}

export function resolveType<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T> {
    const typeRegistration = resolveTypeInternal(type, name);
    const types = typeRegistration.types;
    return types[types.length - 1];
}

export function tryResolveType<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T> | null {
    try {
        const typeRegistration = resolveTypeInternal(type, name);
        const types = typeRegistration.types;
        return types[types.length - 1];
    } catch {
        return null;
    }
}

export function resolveAll<T>(type: AbstractCtor<T>, name?: string): T[] {
    try {
        const serviceRegistration = resolveInternal(type, name);
        return serviceRegistration.services.map(service => serviceRegistration.isSingleton ? service as T : new (service as ParameterlessCtor<T>));
    } catch (e) {
        if (e instanceof ServiceLocatorResolutionError) {
            return [];
        }

        /* c8 ignore next */ throw e;
    }
}

export function resolveAllTypes<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T>[] {
    try {
        const serviceTypeRegistration = resolveTypeInternal(type, name);
        return serviceTypeRegistration.types;
    } catch (e) {
        if (e instanceof ServiceLocatorResolutionError) {
            return [];
        }

        /* c8 ignore next */ throw e;
    }
}

export function registerSingleton<TFrom, TTo extends TFrom>(type: ParameterlessCtor<TFrom>): void;
export function registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instance: TTo, name?: string): void;
export function registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo: ParameterlessCtor<TTo>, name?: string): void;
export function registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor?: ParameterlessCtor<TTo> | TTo, name?: string): void {
    registerInternal(type, instanceOrCtor ?? type as ParameterlessCtor<TFrom>, true, name);
}

export function registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: ParameterlessCtor<TTo>, name?: string): void;
export function registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParams: unknown[], name?: string): void;
export function registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParamsOrName?: unknown[] | string, name?: string): void {
    if (Array.isArray(bindParamsOrName)) {
        const params = bindParamsOrName;
        if (params.length !== ctor.length) {
            throw Error(`Constructor parameter count mismatch when registering ${ctor.name} as transient service.\nExpected ${ctor.length} but got ${params.length}.\nIn case the parameters are optional, set them to undefined.`);
        }
        registerInternal(type, ctor.bind(null, ...params), false, name);
    } else {
        const name = bindParamsOrName;
        registerInternal(type, ctor, false, name);
    }
}

export function registerType<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo?: AbstractCtor<TTo>, name?: string): void {
    registerTypeInternal(type, mappedTo ?? type, name);
}

export function tryRegisterType<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo?: AbstractCtor<TTo>, name?: string): boolean {
    return tryRegisterTypeInternal(type, mappedTo ?? type, name);
}

export function tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instance: TTo, name?: string): boolean;
export function tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo: ParameterlessCtor<TTo>, name?: string): boolean;
export function tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, name?: string): boolean {
    return tryRegisterInternal(type, instanceOrCtor, true, name);
}

export function tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: ParameterlessCtor<TTo>, name?: string): boolean;
export function tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParams?: unknown[], name?: string): boolean;
export function tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParamsOrName?: unknown[] | string, name?: string): boolean {
    if (Array.isArray(bindParamsOrName)) {
        const params = bindParamsOrName;
        if (params.length !== ctor.length) {
            return false;
        }
        return tryRegisterInternal(type, ctor.bind(null, ...params), false, name);
    } else {
        const name = bindParamsOrName;
        return tryRegisterInternal(type, ctor, false, name);
    }
}

export function unregister<T>(type: AbstractCtor<T>, name?: string): void
export function unregister<T>(name: string): void
export function unregister<T>(typeOrName: AbstractCtor<T> | string, name?: string): void {
    if (isConstructor(typeOrName)) {
        const type = typeOrName as AbstractCtor<T>;
        if (!tryUnregister(type, name)) {
            throw new ServiceLocatorUnregisterError(type.name, name);
        }
    } else {
        name = typeOrName as string;
        if (!tryUnregister(name)) {
            throw new ServiceLocatorUnregisterError(null, name);
        }
    }
}

export function unregisterType<T>(type: AbstractCtor<T>, name?: string): void
export function unregisterType<T>(name: string): void
export function unregisterType<T>(typeOrName: AbstractCtor<T> | string, name?: string): void {
    if (isConstructor(typeOrName)) {
        const type = typeOrName as AbstractCtor<T>;
        if (!tryUnregisterType(type, name)) {
            throw new ServiceLocatorUnregisterError(type.name, name);
        }
    } else {
        name = typeOrName as string;
        if (!tryUnregisterType(name)) {
            throw new ServiceLocatorUnregisterError(null, name);
        }
    }
}

export function tryUnregister<T>(type: AbstractCtor<T>, name?: string): boolean
export function tryUnregister<T>(name: string): boolean
export function tryUnregister<T>(typeOrName: AbstractCtor<T> | string, name?: string): boolean {
    if (isConstructor(typeOrName)) {
        const type = typeOrName as AbstractCtor<T>;

        if (name) {
            return getNamedServices().delete(`${type.name}@${name}`);
        }

        return getServices().delete(type.name);
    }

    name = typeOrName as string;
    const foundKeys = Array.from(getNamedServices().keys()).filter(k => k.endsWith(`@${name}`));

    if (foundKeys.length < 1) {
        return false;
    }

    foundKeys.forEach(getNamedServices().delete.bind(getNamedServices()));
    return true;
}

export function tryUnregisterType<T>(type: AbstractCtor<T>, name?: string): boolean
export function tryUnregisterType<T>(name: string): boolean
export function tryUnregisterType<T>(typeOrName: AbstractCtor<T> | string, name?: string): boolean {
    if (isConstructor(typeOrName)) {
        const type = typeOrName as AbstractCtor<T>;

        if (name) {
            return getNamedTypes().delete(`${type.name}@${name}`);
        }

        return getTypes().delete(type.name);
    }

    name = typeOrName as string;
    const foundKeys = Array.from(getNamedTypes().keys()).filter(k => k.endsWith(`@${name}`));

    if (foundKeys.length < 1) {
        return false;
    }

    foundKeys.forEach(getNamedTypes().delete.bind(getNamedTypes()));
    return true;
}

export function isRegistered<TFrom>(type: AbstractCtor<TFrom>, name?: string): boolean {
    if (name) {
        return getNamedServices().has(`${type.name}@${name}`);
    }

    return getServices().has(type.name);
}

export function isTypeRegistered<TFrom>(type: AbstractCtor<TFrom>, name?: string): boolean {
    if (name) {
        return getNamedTypes().has(`${type.name}@${name}`);
    }

    return getTypes().has(type.name);
}

export function getSingletonInstance<T extends object>(classOf: ParameterlessCtor<T>): T {
    const className = classOf.name;
    if (!getSingletons().has(className)) {
        const obj = new classOf() as T;
        getSingletons().set(className, obj);
    }

    return getSingletons().get(className) as T;
}

function tryRegisterInternal<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, isSingleton: boolean, name?: string): boolean {
    if (isRegistered(type, name)) {
        return false;
    }

    registerInternal(type, instanceOrCtor, isSingleton, name);
    return true;
}

function tryRegisterTypeInternal<TFrom, TTo extends TFrom>(fromType: AbstractCtor<TFrom>, toType: AbstractCtor<TTo>, name?: string): boolean {
    const typeName = name ? `${fromType.name}@${name}` : fromType.name;

    if (isTypeRegistered(fromType, name)) {
        return false;
    } else {
        if (name) {
            getNamedTypes().set(typeName, { types: [toType] });
        } else {
            getTypes().set(typeName, { types: [toType] });
        }
        return true;
    }
}

function resolveInternal<T>(type: AbstractCtor<T>, name?: string): ServiceRegistration<T> {
    const key = name ? `${type.name}@${name}` : type.name;
    const resplvedServices = name ? getNamedServices().get(key) : getServices().get(key);

    if (!resplvedServices) {
        throw new ServiceLocatorResolutionError(type.name, name);
    }

    return resplvedServices as ServiceRegistration<T>;
}

function resolveTypeInternal<T>(type: AbstractCtor<T>, name?: string): TypeRegistration<T> {
    const key = name ? `${type.name}@${name}` : type.name;
    const resolvedTypes = name ? getNamedTypes().get(key) : getTypes().get(key);

    if (!resolvedTypes) {
        throw new ServiceLocatorResolutionError(type.name, name);
    }

    return resolvedTypes as TypeRegistration<T>;
}

function registerTypeInternal<TFrom, TTo extends TFrom>(fromType: AbstractCtor<TFrom>, toType: AbstractCtor<TTo>, name?: string): void {
    const typeName = name ? `${fromType.name}@${name}` : fromType.name;

    if (isTypeRegistered(fromType, name)) {
        const typeContainer = name ? getNamedTypes().get(typeName)! : getTypes().get(typeName)!;
        typeContainer.types.push(toType);
    } else {
        (name ? getNamedTypes() : getTypes()).set(typeName, { types: [toType] });
    }
}

function registerInternal<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, isSingleton: boolean, name?: string): void {
    const service = isConstructor(instanceOrCtor) && isSingleton ? new (instanceOrCtor as ParameterlessCtor<TTo>)() : instanceOrCtor as ParameterlessCtor<TTo> | TTo;

    const serviceName = name ? `${type.name}@${name}` : type.name;

    if (isRegistered(type, name)) {
        const serviceContainer = name ? getNamedServices().get(serviceName)! : getServices().get(serviceName)!;

        if ((isSingleton && !serviceContainer.isSingleton) || (!isSingleton && serviceContainer.isSingleton)) {
            const registrationType = isSingleton ? 'singleton' : 'transient';
            throw new ServiceLocatorRegistrationError(type.name, registrationType, name);
        } else {
            serviceContainer.services.push(service);
        }
    } else {
        (name ? getNamedServices() : getServices()).set(serviceName, {
            services: [service],
            isSingleton,
        });
    }
}
