import * as nativeLibrary from '@playwright/test';
import 'reflect-metadata';

import { Symbols } from '@bellatrix/core/constants';
import { TestProps, defineSuiteMetadata, defineTestMetadata, getTestMetadata, setCurrentTest, unsetCurrentTest } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest, PluginExecutionEngine } from '@bellatrix/core/infrastructure';

import type { ConfigureFn, Method, MethodNames, ParameterlessCtor, TestFn } from '@bellatrix/core/types';

const BaseTest = ServiceLocator.resolveType(BellatrixTest);
const testSettings = BellatrixSettings.get().frameworkSettings.testSettings;

function getSymbolMethods<T extends BellatrixTest>(type: ParameterlessCtor<T>) {
    return {
        beforeEach: type.prototype[Symbols.beforeEach] as Method<BellatrixTest, typeof Symbols.beforeEach>,
        beforeAll: type.prototype[Symbols.beforeAll] as Method<BellatrixTest, typeof Symbols.beforeAll>,
        afterAll: type.prototype[Symbols.afterAll] as Method<BellatrixTest, typeof Symbols.afterAll>,
        afterEach: type.prototype[Symbols.afterEach] as Method<BellatrixTest, typeof Symbols.afterEach>,
    } as const;
}

let currentTestClass: BellatrixTest | undefined;
let globalConfigureBlock: Method<BellatrixTest, 'configure'> | undefined;

export function SuiteDecorator<T extends BellatrixTest>(target: ParameterlessCtor<T>): void {
    const testClass = target.prototype;
    defineSuiteMetadata(testClass.constructor);
    const testClassInstance = new (target.prototype.constructor as ParameterlessCtor<T>);
    const testClassSymbolMethods = getSymbolMethods(target);

    const testMethods = Object.getOwnPropertyNames(testClass).filter(method => typeof testClass[method] === 'function' && Reflect.hasMetadata(Symbols.test, testClass[method]));
    const title = target.name; // or passed as @Suite('title') or similar

    nativeLibrary.test.describe(title, () => {
        nativeLibrary.test.beforeAll(async () => await testClassSymbolMethods.beforeAll.call(testClassInstance));

        nativeLibrary.test.beforeEach(async ({}, testInfo) => {
            const currentTestName = testInfo.title;
            // @ts-ignore
            setCurrentTest(currentTestName, testClassInstance[currentTestName], testClass.constructor);
            await testClassSymbolMethods.beforeEach.call(testClassInstance);
        });

        nativeLibrary.test.afterEach(async () => {
            await testClassSymbolMethods.afterEach.call(testClassInstance);
            unsetCurrentTest(testClass.constructor);
        });

        nativeLibrary.test.afterAll(async () => await testClassSymbolMethods.afterAll.call(testClassInstance));

        for (const testMethod of testMethods) {
            nativeLibrary.test(testMethod, async () => {
                nativeLibrary.test.setTimeout(testSettings.testTimeout!);
                try {
                    await testClass[testMethod].call(testClassInstance);
                } catch (error) {
                    if (error instanceof Error) {
                        getTestMetadata(testClass[testMethod]).error = error;
                        throw error;
                    }
                }
            })
        }
    })
}

function test<T extends BellatrixTest, K extends string>(target: T, key: K extends MethodNames<BellatrixTest> ? never : K): void;
function test(name: string, fn: TestFn<TestProps>): void;
function test<T extends BellatrixTest, K extends string>(name: any, fn: any): void {
    if (name instanceof BellatrixTest) {
        const target = name as T;
        const key = fn as K extends MethodNames<BellatrixTest> ? never : K;
        // @ts-ignore
        defineTestMetadata(target[key], target.constructor as ParameterlessCtor<T>);
        return;
    }
    if (!currentTestClass) {
        throw Error('test cannot be called outside of describe block.');
    }

    if (globalConfigureBlock) {
        currentTestClass.constructor.prototype.configure = globalConfigureBlock;
    }

    const testFn = async () => await fn(ServiceLocator.resolve(TestProps));
    Object.defineProperty(testFn, 'name', { value: name });
    currentTestClass.constructor.prototype[name] = testFn;
    test(currentTestClass, name);
}

function describe(title: string, fn: () => void): void {
    currentTestClass = new class extends BaseTest {};
    Object.defineProperty(currentTestClass.constructor, 'name', { value: title });

    fn();
    SuiteDecorator(currentTestClass.constructor as ParameterlessCtor<typeof currentTestClass>);
    currentTestClass = undefined;
}

function beforeAll(fn: TestFn<TestProps>) {
    if (!currentTestClass) {
        throw Error('beforeAll cannot be called outside of describe block.');
    }

    const beforeAll = async () => await fn(ServiceLocator.resolve(TestProps));
    currentTestClass.constructor.prototype.beforeAll = beforeAll;
}

function beforeEach(fn: TestFn<TestProps>) {
    if (!currentTestClass) {
        throw Error('beforeEach cannot be called outside of describe block.');
    }

    const beforeEach = async () => await fn(ServiceLocator.resolve(TestProps));
    currentTestClass.constructor.prototype.beforeEach = beforeEach;
}

function afterEach(fn: TestFn<TestProps>) {
    if (!currentTestClass) {
        throw Error('afterEach cannot be called outside of describe block.');
    }

    const afterEach = async () => await fn(ServiceLocator.resolve(TestProps));
    currentTestClass.constructor.prototype.afterEach = afterEach;
}

function afterAll(fn: TestFn<TestProps>) {
    if (!currentTestClass) {
        throw Error('afterAll cannot be called outside of describe block.');
    }

    const afterAll = async () => await fn(ServiceLocator.resolve(TestProps));
    currentTestClass.constructor.prototype.afterAll = afterAll;
}

function configure(fn: ConfigureFn) {
    const addPlugin = PluginExecutionEngine.addPlugin;

    const configure = async () => await fn({ addPlugin });
    globalConfigureBlock = configure;
}

export {
    configure,
    describe,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    test,
    test as it,
    test as Test,
    SuiteDecorator as suite,
    SuiteDecorator as Suite,
    SuiteDecorator as TestClass,
}