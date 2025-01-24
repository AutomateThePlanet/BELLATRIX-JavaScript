import { describe, afterEach, test } from 'mocha';
import assert from 'assert';

import { ServiceLocator, ServiceLocatorUnregisterError, ServiceLocatorRegistrationError, ServiceLocatorResolutionError } from '@bellatrix/core/utilities';

describe('ServiceLocator', () => {
    class BaseService { }
    class FirstExtendedService extends BaseService { }
    class SecondExtendedService extends BaseService { }
    class ServiceWithOneParam extends BaseService { value: unknown; constructor(param: unknown) { super(); this.value = param; } }

    afterEach(() => {
        ServiceLocator['services'].clear();
        ServiceLocator['namedServices'].clear();
        ServiceLocator['types'].clear();
        ServiceLocator['namedTypes'].clear();
    });

    describe('resolve', () => {
        it('should resolve the proper service when resolving by child', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            const resolvedService = ServiceLocator.resolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should throw if no service is registered', () => {
            assert.throws(() => ServiceLocator.resolve(BaseService), ServiceLocatorResolutionError);
        });

        it('should resolve the service as a singleton when registered using registerSingleton', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            const resolvedService1 = ServiceLocator.resolve(BaseService);
            const resolvedService2 = ServiceLocator.resolve(BaseService);
            assert.strictEqual(resolvedService1, resolvedService2, 'The resolved instances do not point to the same object');
        });

        it('should resolve the the last registered service as a transient service when registered using registerSingleton', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            ServiceLocator.registerSingleton(BaseService, SecondExtendedService);
            const resolvedService = ServiceLocator.resolve(BaseService);
            assert(resolvedService instanceof SecondExtendedService, 'The resolved service is not the last one registered');
        });

        it('should resolve the named service as a singleton when registered using registerSingleton with name', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            const resolvedService1 = ServiceLocator.resolve(BaseService, 'name');
            const resolvedService2 = ServiceLocator.resolve(BaseService, 'name');
            assert.strictEqual(resolvedService1, resolvedService2, 'The resolved instances do not point to the same object');
        });

        it('should not resolve a named service when called without a name', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            assert.throws(() => ServiceLocator.resolve(BaseService), ServiceLocatorResolutionError);
        });

        it('should not resolve a service when no service with the specified name is registered', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => ServiceLocator.resolve(BaseService, 'name'), ServiceLocatorResolutionError);
        });

        it('should throw of no service with a specified name is registered when name is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => ServiceLocator.resolve(BaseService, 'name'), ServiceLocatorResolutionError);
        });

        it('should resolve the service as a transient service when registered using registerTransient', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            const resolvedService1 = ServiceLocator.resolve(BaseService);
            const resolvedService2 = ServiceLocator.resolve(BaseService);
            assert.notStrictEqual(resolvedService1, resolvedService2, 'The resolved instances point to the same object');
        });

        it('should resolve the the last registered service as a transient service when registered using registerTransient', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            ServiceLocator.registerTransient(BaseService, SecondExtendedService);
            const resolvedService = ServiceLocator.resolve(BaseService);
            assert(resolvedService instanceof SecondExtendedService, 'The resolved service is not the last one registered');
        });

        it('should resolve the named service as a transient service when registered using registerTransient with name', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService, 'name');
            const resolvedService1 = ServiceLocator.resolve(BaseService, 'name');
            const resolvedService2 = ServiceLocator.resolve(BaseService, 'name');
            assert.notStrictEqual(resolvedService1, resolvedService2, 'The resolved instances point to the same object');
        });
    });

    describe('tryResolve', () => {
        it('should resolve the proper service registered using registerSingleton when resolving by child', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            const resolvedService = ServiceLocator.tryResolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should resolve the proper service registered using registerTransient when resolving by child', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            const resolvedService = ServiceLocator.tryResolve(BaseService);
            assert(resolvedService instanceof FirstExtendedService, 'The resolved instance if not instance of ExtendedService');
        });

        it('should not throw if no service is registered', () => {
            assert.doesNotThrow(() => ServiceLocator.tryResolve(BaseService));
        });

        it('should return null no service is registered', () => {
            const resolvedService = ServiceLocator.tryResolve(BaseService);
            assert.strictEqual(resolvedService, null);
        });
    });

    describe('resolveAll', () => {
        it('should resolve all services registered services in order when registered with registerSingleton', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            ServiceLocator.registerSingleton(BaseService, SecondExtendedService);
            const services = ServiceLocator.resolveAll(BaseService);
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });

        it('should resolve all services registered services in order when registered with registerTransient', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            ServiceLocator.registerTransient(BaseService, SecondExtendedService);
            const services = ServiceLocator.resolveAll(BaseService);
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });

        it('should return an empty array if no service is registered', () => {
            const services = ServiceLocator.resolveAll(BaseService);
            assert.deepStrictEqual(services, []);
        });

        it('should resolve all named services registered services in order when name is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            ServiceLocator.registerSingleton(BaseService, SecondExtendedService, 'name');
            const services = ServiceLocator.resolveAll(BaseService, 'name');
            assert(services.length === 2
                && services[0] instanceof FirstExtendedService
                && services[1] instanceof SecondExtendedService,
            'The resolved services were either not all resolved or not in the correct order');
        });
    });

    describe('registerSingleton', () => {
        it('should register a singleton to its own type if only one parameter is passed', () => {
            ServiceLocator.registerSingleton(BaseService);
            const resolvedService = ServiceLocator.resolve(BaseService);
            assert(resolvedService instanceof BaseService, 'The resolved service is not instance of BaseService');
        });

        it('should throw if the service is already registered as transient', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            assert.throws(() => ServiceLocator.registerSingleton(BaseService, FirstExtendedService), ServiceLocatorRegistrationError);
        });

        it('should throw if the service is already registered as transient with the same name that is passed', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService, 'name');
            assert.throws(() => ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name'), ServiceLocatorRegistrationError);
        });
    });

    describe('tryRegisterSingleton', () => {
        it('should return true when no service is registered', () => {
            const result = ServiceLocator.tryRegisterSingleton(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a service registered', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            const result = ServiceLocator.tryRegisterSingleton(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should return false if the service is already registered as transient', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            const result = ServiceLocator.tryRegisterSingleton(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });
    });

    describe('registerTransient', () => {
        it('should throw if the service is already registered as singleton', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => ServiceLocator.registerTransient(BaseService, FirstExtendedService), ServiceLocatorRegistrationError);
        });

        it('should register service with params', () => {
            ServiceLocator.registerTransient(BaseService, ServiceWithOneParam, ['parameter']);
            const resolvedService = ServiceLocator.resolve(BaseService) as ServiceWithOneParam;
            assert.strictEqual(resolvedService.value, 'parameter');
        });

        it('should throw if the service has mismatched params count', () => {
            assert.throws(() => ServiceLocator.registerTransient(BaseService, ServiceWithOneParam, ['one', 'two']), Error);
        });

        it('should throw if the service is already registered as singleton with a the same name that is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            assert.throws(() => ServiceLocator.registerTransient(BaseService, FirstExtendedService, 'name'), ServiceLocatorRegistrationError);
        });
    });

    describe('tryRegisterTransient', () => {
        it('should register service with params', () => {
            ServiceLocator.tryRegisterTransient(BaseService, ServiceWithOneParam, ['parameter']);
            const resolvedService = ServiceLocator.resolve(BaseService) as ServiceWithOneParam;
            assert.strictEqual(resolvedService.value, 'parameter');
        });

        it('should return false if wrong parameter count is passed', () => {
            const result = ServiceLocator.tryRegisterTransient(BaseService, ServiceWithOneParam, ['one', 'two']);
            assert.strictEqual(result, false);
        });

        it('should return false if the service is already registered as singleton', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            const result = ServiceLocator.tryRegisterTransient(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should return true when no service is registered', () => {
            const result = ServiceLocator.tryRegisterTransient(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a service registered', () => {
            ServiceLocator.registerTransient(BaseService, FirstExtendedService);
            const result = ServiceLocator.tryRegisterTransient(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });
    });

    describe('resolveType', () => {
        it('should resolve the proper type when resolving by child', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            const resolvedType = ServiceLocator.resolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should throw if no type is registered', () => {
            assert.throws(() => ServiceLocator.resolveType(BaseService), ServiceLocatorResolutionError);
        });
    });

    describe('tryResolveType', () => {
        it('should resolve the proper type when resolving by child', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            const resolvedType = ServiceLocator.tryResolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should not throw if no type is registered', () => {
            assert.doesNotThrow(() => ServiceLocator.tryResolveType(BaseService));
        });

        it('should return null throw if no type is registered', () => {
            const resolvedType = ServiceLocator.tryResolveType(BaseService);
            assert.strictEqual(resolvedType, null);
        });
    });

    describe('registerType', () => {
        it('should register to itself if only one parameter is passed', () => {
            ServiceLocator.registerType(BaseService);
            const resolvedType = ServiceLocator.resolveType(BaseService);
            assert.strictEqual(resolvedType, BaseService);
        });

        it('should register the type to a specified name when name is passed', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService, 'name');
            const resolvedType = ServiceLocator.resolveType(BaseService, 'name');
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should be able to register more than one type with name', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService, 'name');
            assert.doesNotThrow(() => ServiceLocator.registerType(BaseService, SecondExtendedService, 'name'));
        });
    });

    describe('tryRegisterType', () => {
        it('should return true when no type is registered', () => {
            const result = ServiceLocator.tryRegisterType(BaseService, FirstExtendedService);
            assert.strictEqual(result, true);
        });

        it('should return false when there is already a type registered', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            const result = ServiceLocator.tryRegisterType(BaseService, SecondExtendedService);
            assert.strictEqual(result, false);
        });

        it('should not register of there is already a type registered', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            ServiceLocator.tryRegisterType(BaseService, SecondExtendedService);
            const resolvedType = ServiceLocator.resolveType(BaseService);
            assert.strictEqual(resolvedType, FirstExtendedService);
        });

        it('should register to itself if only one parameter is passed', () => {
            ServiceLocator.tryRegisterType(BaseService);
            const resolvedType = ServiceLocator.resolveType(BaseService);
            assert.strictEqual(resolvedType, BaseService);
        });

        it('should register the type to a specified name if name is passed', () => {
            ServiceLocator.tryRegisterType(BaseService, FirstExtendedService, 'name');
            const resolvedType = ServiceLocator.resolveType(BaseService, 'name');
            assert.strictEqual(resolvedType, FirstExtendedService);
        });
    });

    describe('resolveAllTypes', () => {
        it('should resolve all registered types in order', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            ServiceLocator.registerType(BaseService, SecondExtendedService);
            const resolvedTypes = ServiceLocator.resolveAllTypes(BaseService);
            assert.deepStrictEqual(resolvedTypes, [FirstExtendedService, SecondExtendedService]);
        });

        it('should return an empty array if no type is registered', () => {
            const resolvedTypes = ServiceLocator.resolveAllTypes(BaseService);
            assert.deepStrictEqual(resolvedTypes, []);
        });
    });

    describe('unregister', () => {
        it('should unregister a service', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            ServiceLocator.unregister(BaseService);
            const result = ServiceLocator.tryResolve(BaseService);
            assert.strictEqual(result, null);
        });

        it('should throw if no service is registered', () => {
            assert.throws(() => ServiceLocator.unregister(BaseService), ServiceLocatorUnregisterError);
        });

        it('should unregister a service with a specified name if name is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            ServiceLocator.unregister(BaseService, 'name');
            const result = ServiceLocator.tryResolve(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister all services with a specified name when name is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService, 'name');
            ServiceLocator.registerSingleton(SecondExtendedService, SecondExtendedService, 'name');
            ServiceLocator.unregister('name');
            const result = [ServiceLocator.tryResolve(BaseService), ServiceLocator.tryResolve(SecondExtendedService)];
            assert.deepStrictEqual(result, [null, null]);
        });

        it('should throw if no service with a specified name is registered when only name is passed', () => {
            ServiceLocator.registerSingleton(BaseService, FirstExtendedService);
            assert.throws(() => ServiceLocator.unregister('name'), ServiceLocatorUnregisterError);
        });
    });

    describe('unregisterType', () => {
        it('should unregister a type', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService);
            ServiceLocator.unregisterType(BaseService);
            const result = ServiceLocator.tryResolveType(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister a type with a specified name when name is passed', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService, 'name');
            ServiceLocator.unregisterType(BaseService, 'name');
            const result = ServiceLocator.tryResolveType(BaseService);
            assert.strictEqual(result, null);
        });

        it('should unregister all types with a specified name if only name is passed', () => {
            ServiceLocator.registerType(BaseService, FirstExtendedService, 'name');
            ServiceLocator.registerType(SecondExtendedService, SecondExtendedService, 'name');
            ServiceLocator.unregisterType('name');
            const result = [ServiceLocator.tryResolveType(BaseService), ServiceLocator.tryResolveType(SecondExtendedService)];
            assert.deepStrictEqual(result, [null, null]);
        });

        it('should throw if no such type is registered', () => {
            assert.throws(() => ServiceLocator.unregisterType(BaseService), ServiceLocatorUnregisterError);
        });

        it('should throw if no type with a specified name is registered when only name is passed', () => {
            assert.throws(() => ServiceLocator.unregisterType('name'), ServiceLocatorUnregisterError);
        });
    });
});
