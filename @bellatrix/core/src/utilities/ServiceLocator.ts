import { Utilities } from '.';

import type { AbstractCtor, Ctor, ParameterlessCtor } from '@bellatrix/core/types'

type ServiceRegistration = {
    services: any[];
    isSingleton: boolean;
}

type TypeRegistration = {
    types: AbstractCtor<any>[];
}

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
        super(`Registration of type ${type}${serviceName} is already registered as ${registrationType === 'singleton' ? 'transient' : 'singleton'} and cannot be reregistered as ${registrationType}. Please unregister it.`);
        this.name = this.constructor.name;
    }
}

export class ServiceLocatorResolutionError extends ServiceLocatorError {
    constructor(type: string, name?: string) {
        const serviceName = name ? ` under the ${name} name` : '';
        super(`No registration of type ${type} was found${serviceName} in the ServiceLocator.`);
        this.name = this.constructor.name;
    }
}

export class ServiceLocator {
    private static readonly services: Map<string, ServiceRegistration> = new Map();
    private static readonly namedServices: Map<string, ServiceRegistration> = new Map();
    private static readonly types: Map<string, TypeRegistration> = new Map();
    private static readonly namedTypes: Map<string, TypeRegistration> = new Map();

    private constructor() { /* c8 ignore next */ throw new Error('ServiceLocator is static and cannot be instantiated') }

    static resolve<T>(type: AbstractCtor<T>, name?: string): T {
        const serviceRegistration = this.resolveInternal(type, name);
        const services = serviceRegistration.services;
        return serviceRegistration.isSingleton ? services[services.length - 1] as T : new (services[services.length - 1] as ParameterlessCtor<T>);
    }

    static tryResolve<T>(type: AbstractCtor<T>, name?: string): T | null {
        try {
            const serviceRegistration = this.resolveInternal(type, name);
            const services = serviceRegistration.services;
            return serviceRegistration.isSingleton ? services[services.length - 1] as T : new (services[services.length - 1] as ParameterlessCtor<T>);
        } catch {
            return null;
        }
    }

    static resolveType<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T> {
        const typeRegistration = this.resolveTypeInternal(type, name);
        const types = typeRegistration.types;
        return types[types.length - 1];
    }

    static tryResolveType<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T> | null {
        try {
            const typeRegistration = this.resolveTypeInternal(type, name);
            const types = typeRegistration.types;
            return types[types.length - 1];
        } catch {
            return null;
        }
    }

    static resolveAll<T>(type: AbstractCtor<T>, name?: string): T[] {
        try {
            const serviceRegistration = this.resolveInternal(type, name);
            return serviceRegistration.services.map(service => serviceRegistration.isSingleton ? service as T : new (service as ParameterlessCtor<T>));
        } catch (e) {
            if (e instanceof ServiceLocatorResolutionError) {
                return [];
            }
            /* c8 ignore next */ throw e;
        }
    }

    static resolveAllTypes<T>(type: AbstractCtor<T>, name?: string): AbstractCtor<T>[] {
        try {
            const serviceTypeRegistration = this.resolveTypeInternal(type, name);
            return serviceTypeRegistration.types;
        } catch (e) {
            if (e instanceof ServiceLocatorResolutionError) {
                return [];
            }
            /* c8 ignore next */ throw e;
        }
    }

    static registerSingleton<TFrom, TTo extends TFrom>(type: ParameterlessCtor<TFrom>): void;
    static registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instance: TTo, name?: string): void;
    static registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo: ParameterlessCtor<TTo>, name?: string): void;
    static registerSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor?: ParameterlessCtor<TTo> | TTo, name?: string): void {
        this.registerInternal(type, instanceOrCtor ?? type as ParameterlessCtor<TFrom>, true, name);
    }

    static registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: ParameterlessCtor<TTo>, name?: string): void;
    static registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParams: ConstructorParameters<typeof ctor>, name?: string): void;
    static registerTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo>, bindParamsOrName?: any[] | string, name?: string): void {
        if (Array.isArray(bindParamsOrName)) {
            const params = bindParamsOrName;
            if (params.length !== ctor.length) {
                throw Error(`Constructor parameter count mismatch when registering ${ctor.name} as transient service.\nExpected ${ctor.length} but got ${params.length}.\nIn case the parameters are optional, set them to undefined.`)
            }
            this.registerInternal(type, ctor.bind(null, ...params), false, name);
        } else {
            const name = bindParamsOrName;
            this.registerInternal(type, ctor, false, name);
        }
    }

    static registerType<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo?: AbstractCtor<TTo>, name?: string): void {
        this.registerTypeInternal(type, mappedTo ?? type, name);
    }

    static tryRegisterType<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo?: AbstractCtor<TTo>, name?: string): boolean {
        return this.tryRegisterTypeInternal(type, mappedTo ?? type, name);
    }

    static tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instance: TTo, name?: string): boolean;
    static tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, mappedTo: ParameterlessCtor<TTo>, name?: string): boolean;
    static tryRegisterSingleton<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, name?: string): boolean {
        return this.tryRegisterInternal(type, instanceOrCtor, true, name);
    }

    static tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: ParameterlessCtor<TTo> , name?: string): boolean;
    static tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo> , bindParams?: any[], name?: string): boolean;
    static tryRegisterTransient<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, ctor: Ctor<TTo> , bindParamsOrName?: any[] | string, name?: string): boolean {
        if (Array.isArray(bindParamsOrName)) {
            const params = bindParamsOrName;
            if (params.length !== ctor.length) {
                return false;
            }
            return this.tryRegisterInternal(type, ctor.bind(null, ...params), false, name);
        } else {
            const name = bindParamsOrName;
            return this.tryRegisterInternal(type, ctor, false, name);
        }
    }

    static unregister<T>(type: AbstractCtor<T>, name?: string): void
    static unregister<T>(name: string): void
    static unregister<T>(typeOrName: AbstractCtor<T> | string, name?: string): void {
        if (Utilities.isConstructor(typeOrName)) {
            const type = typeOrName as AbstractCtor<T>;
            if (!this.tryUnregister(type, name)) {
                throw new ServiceLocatorUnregisterError(type.name, name);
            }
        } else {
            name = typeOrName as string;
            if (!this.tryUnregister(name)) {
                throw new ServiceLocatorUnregisterError(null, name);
            }
        }
    }

    static unregisterType<T>(type: AbstractCtor<T>, name?: string): void
    static unregisterType<T>(name: string): void
    static unregisterType<T>(typeOrName: AbstractCtor<T> | string, name?: string): void {
        if (Utilities.isConstructor(typeOrName)) {
            const type = typeOrName as AbstractCtor<T>;
            if (!this.tryUnregisterType(type, name)) {
                throw new ServiceLocatorUnregisterError(type.name, name);
            }
        } else {
            name = typeOrName as string;
            if (!this.tryUnregisterType(name)) {
                throw new ServiceLocatorUnregisterError(null, name);
            }
        }
    }

    static tryUnregister<T>(type: AbstractCtor<T>, name?: string): boolean
    static tryUnregister<T>(name: string): boolean
    static tryUnregister<T>(typeOrName: AbstractCtor<T> | string, name?: string): boolean {
        if (Utilities.isConstructor(typeOrName)) {
            const type = typeOrName as AbstractCtor<T>;

            if (name) {
                return this.namedServices.delete(`${type.name}@${name}`);
            }
    
            return this.services.delete(type.name);
        }

        name = typeOrName as string;
        const foundKeys = Array.from(this.namedServices.keys()).filter(k => k.endsWith(`@${name}`));

        if (foundKeys.length < 1) {
            return false;
        }

        foundKeys.forEach(this.namedServices.delete.bind(this.namedServices));
        return true;
    }

    static tryUnregisterType<T>(type: AbstractCtor<T>, name?: string): boolean
    static tryUnregisterType<T>(name: string): boolean
    static tryUnregisterType<T>(typeOrName: AbstractCtor<T> | string, name?: string): boolean {
        if (Utilities.isConstructor(typeOrName)) {
            const type = typeOrName as AbstractCtor<T>;

            if (name) {
                return this.namedTypes.delete(`${type.name}@${name}`);
            }
    
            return this.types.delete(type.name);
        }

        name = typeOrName as string;
        const foundKeys = Array.from(this.namedTypes.keys()).filter(k => k.endsWith(`@${name}`));

        if (foundKeys.length < 1) {
            return false;
        }

        foundKeys.forEach(this.namedTypes.delete.bind(this.namedTypes));
        return true;
    }

    static isRegistered<TFrom>(type: AbstractCtor<TFrom>, name?: string): boolean {
        if (name) {
            return this.namedServices.has(`${type.name}@${name}`);
        }

        return this.services.has(type.name);
    }

    static isTypeRegistered<TFrom>(type: AbstractCtor<TFrom>, name?: string): boolean {
        if (name) {
            return this.namedTypes.has(`${type.name}@${name}`);
        }

        return this.types.has(type.name);
    }

    private static tryRegisterInternal<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, isSingleton: boolean, name?: string): boolean {
        if (this.isRegistered(type, name)) {
            return false;
        }

        this.registerInternal(type, instanceOrCtor, isSingleton, name);
        return true;
    }

    private static tryRegisterTypeInternal<TFrom, TTo extends TFrom>(fromType: AbstractCtor<TFrom>, toType: AbstractCtor<TTo>, name?: string): boolean {
        const typeName = name ? `${fromType.name}@${name}` : fromType.name;

        if (this.isTypeRegistered(fromType, name)) {
            return false;
        } else {
            name ? this.namedTypes.set(typeName, { types: [toType] }) : this.types.set(typeName, { types: [toType] });
            return true;
        }
    }

    private static resolveInternal<T>(type: AbstractCtor<T>, name?: string): ServiceRegistration {
        const key = name ? `${type.name}@${name}` : type.name;
        const services = name ? this.namedServices.get(key) : this.services.get(key);

        if (!services) {
            throw new ServiceLocatorResolutionError(type.name, name);
        }

        return services;
    }

    private static resolveTypeInternal<T>(type: AbstractCtor<T>, name?: string): TypeRegistration {
        const key = name ? `${type.name}@${name}` : type.name;
        const types = name ? this.namedTypes.get(key) : this.types.get(key);

        if (!types) {
            throw new ServiceLocatorResolutionError(type.name, name);
        }

        return types;
    }

    private static registerTypeInternal<TFrom, TTo extends TFrom>(fromType: AbstractCtor<TFrom>, toType: AbstractCtor<TTo>, name?: string): void {
        const typeName = name ? `${fromType.name}@${name}` : fromType.name;

        if (this.isTypeRegistered(fromType, name)) {
            const typeContainer = name ? this.namedTypes.get(typeName)! : this.types.get(typeName)!;
            typeContainer.types.push(toType);
        } else {
            name ? this.namedTypes.set(typeName, { types: [toType] }) : this.types.set(typeName, { types: [toType] });
        }
    }

    private static registerInternal<TFrom, TTo extends TFrom>(type: AbstractCtor<TFrom>, instanceOrCtor: ParameterlessCtor<TTo> | TTo, isSingleton: boolean, name?: string): void {
        const service = Utilities.isConstructor(instanceOrCtor) && isSingleton ? new (instanceOrCtor as ParameterlessCtor<TTo>)() : instanceOrCtor as ParameterlessCtor<TTo> | TTo;

        const serviceName = name ? `${type.name}@${name}` : type.name;

        if (this.isRegistered(type, name)) {
            const serviceContainer = name ? this.namedServices.get(serviceName)! : this.services.get(serviceName)!;

            if ((isSingleton && !serviceContainer.isSingleton) || (!isSingleton && serviceContainer.isSingleton)) {
                const registrationType = isSingleton ? 'singleton' : 'transient';
                throw new ServiceLocatorRegistrationError(type.name, registrationType, name);
            }

            serviceContainer.services.push(service);
        } else {
            name ? this.namedServices.set(serviceName, {
                services: [service],
                isSingleton,
            }) : this.services.set(serviceName, {
                services: [service],
                isSingleton,
            });
        }
    }
}