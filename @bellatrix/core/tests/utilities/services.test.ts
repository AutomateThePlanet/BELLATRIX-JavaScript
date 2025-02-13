import { describe, afterEach, it } from 'mocha';
import assert from 'assert';

import { ServiceLocatorUnregisterError, ServiceLocatorRegistrationError, ServiceLocatorResolutionError, registerSingleton, registerTransient, registerType, resolve, resolveAll, resolveAllTypes, resolveType, tryRegisterSingleton, tryRegisterTransient, tryRegisterType, tryResolve, tryResolveType, unregister, unregisterType } from '@bellatrix/core/utilities';
import { Internal } from '../../src/test/_common';

import type { ServiceRegistration, TypeRegistration } from '@bellatrix/core/types';

type GlobalStore = {
    [Internal.singletons]: Map<string, object>,
    [Internal.services]: Map<string, ServiceRegistration<unknown>>,
    [Internal.namedServices]: Map<string, ServiceRegistration<unknown>>,
    [Internal.types]: Map<string, TypeRegistration<unknown>>,
    [Internal.namedTypes]: Map<string, TypeRegistration<unknown>>,
} & typeof globalThis;

const clearSingletons: () => void = () => (globalThis as GlobalStore)[Internal.singletons].clear();
const clearServices: () => void = () => (globalThis as GlobalStore)[Internal.services].clear();
const clearNamedServices: () => void = () => (globalThis as GlobalStore)[Internal.namedServices].clear();
const clearTypes: () => void = () => (globalThis as GlobalStore)[Internal.types].clear();
const clearNamedTypes: () => void = () => (globalThis as GlobalStore)[Internal.namedTypes].clear();

describe('ServiceLocator', () => {
    class BaseService { }
    class FirstExtendedService extends BaseService { }
    class SecondExtendedService extends BaseService { }
    class ServiceWithOneParam extends BaseService { value: unknown; constructor(param: unknown) { super(); this.value = param; } }

    afterEach(() => {
        clearServices();
        clearNamedServices();
        clearTypes();
        clearNamedTypes();
        clearSingletons();
    });

    describe('resolve', () => {
        it('should resolve the proper service when resolving by child', () => {
            registerSingleton(BaseService, FirstExtendedService);
            const resolvedService = resolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should throw if no service is registered', () => {
            assert.throws(() => resolve(BaseService), ServiceLocatorResolutionError);
        });

        it('should resolve the service as a singleton when registered using registerSingleton', () => {
            registerSingleton(BaseService, FirstExtendedService);
            const resolvedService1 = resolve(BaseService);
            const resolvedService2 = resolve(BaseService);
            assert.strictEqual(resolvedService1, resolvedService2, 'The resolved instances do not point to the same object');
        });

        it('should resolve the the last registered service as a transient service when registered using registerSingleton', () => {
            registerSingleton(BaseService, FirstExtendedService);
            registerSingleton(BaseService, SecondExtendedService);
            const resolvedService = resolve(BaseService);
            assert(resolvedService instanceof SecondExtendedService, 'The resolved service is not the last one registered');
        });

        it('should resolve the named service as a singleton when registered using registerSingleton with name', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            const resolvedService1 = resolve(BaseService, 'name');
            const resolvedService2 = resolve(BaseService, 'name');
            assert.strictEqual(resolvedService1, resolvedService2, 'The resolved instances do not point to the same object');
        });

        it('should not resolve a named service when called without a name', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            assert.throws(() => resolve(BaseService), ServiceLocatorResolutionError);
        });

        it('should not resolve a service when no service with the specified name is registered', () => {
            registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => resolve(BaseService, 'name'), ServiceLocatorResolutionError);
        });

        it('should throw of no service with a specified name is registered when name is passed', () => {
            registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => resolve(BaseService, 'name'), ServiceLocatorResolutionError);
        });

        it('should resolve the service as a transient service when registered using registerTransient', () => {
            registerTransient(BaseService, FirstExtendedService);
            const resolvedService1 = resolve(BaseService);
            const resolvedService2 = resolve(BaseService);
            assert.notStrictEqual(resolvedService1, resolvedService2, 'The resolved instances point to the same object');
        });

        it('should resolve the the last registered service as a transient service when registered using registerTransient', () => {
            registerTransient(BaseService, FirstExtendedService);
            registerTransient(BaseService, SecondExtendedService);
            const resolvedService = resolve(BaseService);
            assert(resolvedService instanceof SecondExtendedService, 'The resolved service is not the last one registered');
        });

        it('should resolve the named service as a transient service when registered using registerTransient with name', () => {
            registerTransient(BaseService, FirstExtendedService, 'name');
            const resolvedService1 = resolve(BaseService, 'name');
            const resolvedService2 = resolve(BaseService, 'name');
            assert.notStrictEqual(resolvedService1, resolvedService2, 'The resolved instances point to the same object');
        });
    });

    describe('tryResolve', () => {
        it('should resolve the proper service registered using registerSingleton when resolving by child', () => {
            registerSingleton(BaseService, FirstExtendedService);
            const resolvedService = tryResolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should resolve the proper service registered using registerTransient when resolving by child', () => {
            registerTransient(BaseService, FirstExtendedService);
            const resolvedService = tryResolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should not throw if no service is registered', () => {
            assert.doesNotThrow(() => tryResolve(BaseService));
        });

        it('should return null no service is registered', () => {
            const resolvedService = tryResolve(BaseService);
            assert.strictEqual(resolvedService, null);
        });
    });

    describe('resolveAll', () => {
        it('should resolve all services registered services in order when registered with registerSingleton', () => {
            registerSingleton(BaseService, FirstExtendedService);
            registerSingleton(BaseService, SecondExtendedService);
            const services = resolveAll(BaseService);
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });

        it('should resolve all services registered services in order when registered with registerTransient', () => {
            registerTransient(BaseService, FirstExtendedService);
            registerTransient(BaseService, SecondExtendedService);
            const services = resolveAll(BaseService);
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });

        it('should return an empty array if no service is registered', () => {
            const services = resolveAll(BaseService);
            assert.deepStrictEqual(services, []);
        });

        it('should resolve all named services registered services in order when name is passed', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            registerSingleton(BaseService, SecondExtendedService, 'name');
            const services = resolveAll(BaseService, 'name');
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });
    });

    describe('registerSingleton', () => {
        it('should register a singleton to its own type if only one parameter is passed', () => {
            registerSingleton(BaseService);
            const resolvedService = resolve(BaseService);
            assert(resolvedService instanceof BaseService, 'The resolved service is not instance of BaseService');
        });

        it('should throw if the service is already registered as transient', () => {
            registerTransient(BaseService, FirstExtendedService);
            assert.throws(() => registerSingleton(BaseService, FirstExtendedService), ServiceLocatorRegistrationError);
        });

        it('should throw if the service is already registered as transient with the same name that is passed', () => {
            registerTransient(BaseService, FirstExtendedService, 'name');
            assert.throws(() => registerSingleton(BaseService, FirstExtendedService, 'name'), ServiceLocatorRegistrationError);
        });
    });

    describe('tryRegisterSingleton', () => {
        it('should return true when no service is registered', () => {
            const result = tryRegisterSingleton(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a service registered', () => {
            registerSingleton(BaseService, FirstExtendedService);
            const result = tryRegisterSingleton(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should return false if the service is already registered as transient', () => {
            registerTransient(BaseService, FirstExtendedService);
            const result = tryRegisterSingleton(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });
    });

    describe('registerTransient', () => {
        it('should throw if the service is already registered as singleton', () => {
            registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => registerTransient(BaseService, FirstExtendedService), ServiceLocatorRegistrationError);
        });

        it('should register service with params', () => {
            registerTransient(BaseService, ServiceWithOneParam, ['parameter']);
            const resolvedService = resolve(BaseService) as ServiceWithOneParam;
            assert.strictEqual(resolvedService.value, 'parameter');
        });

        it('should throw if the service has mismatched params count', () => {
            assert.throws(() => registerTransient(BaseService, ServiceWithOneParam, ['one', 'two']), Error);
        });

        it('should throw if the service is already registered as singleton with a the same name that is passed', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            assert.throws(() => registerTransient(BaseService, FirstExtendedService, 'name'), ServiceLocatorRegistrationError);
        });
    });

    describe('tryRegisterTransient', () => {
        it('should register service with params', () => {
            tryRegisterTransient(BaseService, ServiceWithOneParam, ['parameter']);
            const resolvedService = resolve(BaseService) as ServiceWithOneParam;
            assert.strictEqual(resolvedService.value, 'parameter');
        });

        it('should return false if wrong parameter count is passed', () => {
            const result = tryRegisterTransient(BaseService, ServiceWithOneParam, ['one', 'two']);
            assert.strictEqual(result, false);
        });

        it('should return false if the service is already registered as singleton', () => {
            registerSingleton(BaseService, FirstExtendedService);
            const result = tryRegisterTransient(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should return true when no service is registered', () => {
            const result = tryRegisterTransient(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a service registered', () => {
            registerTransient(BaseService, FirstExtendedService);
            const result = tryRegisterTransient(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });
    });

    describe('resolveType', () => {
        it('should resolve the proper type when resolving by child', () => {
            registerType(BaseService, FirstExtendedService);
            const resolvedType = resolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should throw if no type is registered', () => {
            assert.throws(() => resolveType(BaseService), ServiceLocatorResolutionError);
        });
    });

    describe('tryResolveType', () => {
        it('should resolve the proper type when resolving by child', () => {
            registerType(BaseService, FirstExtendedService);
            const resolvedType = tryResolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should not throw if no type is registered', () => {
            assert.doesNotThrow(() => tryResolveType(BaseService));
        });

        it('should return null throw if no type is registered', () => {
            const resolvedType = tryResolveType(BaseService);
            assert.strictEqual(resolvedType, null);
        });
    });

    describe('registerType', () => {
        it('should register to itself if only one parameter is passed', () => {
            registerType(BaseService);
            const resolvedType = resolveType(BaseService);
            assert.strictEqual(resolvedType, BaseService);
        });

        it('should register the type to a specified name when name is passed', () => {
            registerType(BaseService, FirstExtendedService, 'name');
            const resolvedType = resolveType(BaseService, 'name');
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should be able to register more than one type with name', () => {
            registerType(BaseService, FirstExtendedService, 'name');
            assert.doesNotThrow(() => registerType(BaseService, SecondExtendedService, 'name'));
        });
    });

    describe('tryRegisterType', () => {
        it('should return true when no type is registered', () => {
            const result = tryRegisterType(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a type registered', () => {
            registerType(BaseService, FirstExtendedService);
            const result = tryRegisterType(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should not register of there is already a type registered', () => {
            registerType(BaseService, FirstExtendedService);
            tryRegisterType(BaseService, SecondExtendedService);
            const resolvedType = resolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should register to itself if only one parameter is passed', () => {
            tryRegisterType(BaseService);
            const resolvedType = resolveType(BaseService);
            assert.strictEqual(resolvedType, BaseService);
        });

        it('should register the type to a specified name if name is passed', () => {
            tryRegisterType(BaseService, FirstExtendedService, 'name');
            const resolvedType = resolveType(BaseService, 'name');
            assert.strictEqual(resolvedType, FirstExtendedService);
        });
    });

    describe('resolveAllTypes', () => {
        it('should resolve all registered types in order', () => {
            registerType(BaseService, FirstExtendedService);
            registerType(BaseService, SecondExtendedService);
            const resolvedTypes = resolveAllTypes(BaseService);
            assert.deepStrictEqual(resolvedTypes, [FirstExtendedService, SecondExtendedService]);
        });

        it('should return an empty array if no type is registered', () => {
            const resolvedTypes = resolveAllTypes(BaseService);
            assert.deepStrictEqual(resolvedTypes, []);
        });
    });

    describe('unregister', () => {
        it('should unregister a service', () => {
            registerSingleton(BaseService, FirstExtendedService);
            unregister(BaseService);
            const result = tryResolve(BaseService);
            assert.strictEqual(result, null);
        });

        it('should throw if no service is registered', () => {
            assert.throws(() => unregister(BaseService), ServiceLocatorUnregisterError);
        });

        it('should unregister a service with a specified name if name is passed', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            unregister(BaseService, 'name');
            const result = tryResolve(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister all services with a specified name when name is passed', () => {
            registerSingleton(BaseService, FirstExtendedService, 'name');
            registerSingleton(SecondExtendedService, SecondExtendedService, 'name');
            unregister('name');
            const result = [tryResolve(BaseService), tryResolve(SecondExtendedService)];
            assert.deepStrictEqual(result, [null, null]);
        });

        it('should throw if no service with a specified name is registered when only name is passed', () => {
            registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => unregister('name'), ServiceLocatorUnregisterError);
        });
    });

    describe('unregisterType', () => {
        it('should unregister a type', () => {
            registerType(BaseService, FirstExtendedService);
            unregisterType(BaseService);
            const result = tryResolveType(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister a type with a specified name when name is passed', () => {
            registerType(BaseService, FirstExtendedService, 'name');
            unregisterType(BaseService, 'name');
            const result = tryResolveType(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister all types with a specified name if only name is passed', () => {
            registerType(BaseService, FirstExtendedService, 'name');
            registerType(SecondExtendedService, SecondExtendedService, 'name');
            unregisterType('name');
            const result = [tryResolveType(BaseService), tryResolveType(SecondExtendedService)];
            assert.deepStrictEqual(result, [null, null]);
        });

        it('should throw if no such type is registered', () => {
            assert.throws(() => unregisterType(BaseService), ServiceLocatorUnregisterError);
        });

        it('should throw if no type with a specified name is registered when only name is passed', () => {
            assert.throws(() => unregisterType('name'), ServiceLocatorUnregisterError);
        });
    });
});
