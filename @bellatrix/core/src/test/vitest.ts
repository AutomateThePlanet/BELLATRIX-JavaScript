import * as nativeLibrary from 'vitest';
import 'reflect-metadata';

import { Symbols } from '@bellatrix/core/constants';
import { TestProps, defineSuiteMetadata, defineTestMetadata, getTestMetadata, setCurrentTest, unsetCurrentTest } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest, PluginExecutionEngine } from '@bellatrix/core/infrastructure';

import type { ConfigureFn, Method, MethodNames, ParameterlessCtor, TestFn } from '@bellatrix/core/types';

const BaseTest = ServiceLocator.resolveType(BellatrixTest);
const testSettings = BellatrixSettings.get().frameworkSettings.testSettings;
const testFilters = JSON.parse(process.env.BELLATRIX_TEST_FILTER!);

function getSymbolMethods<T extends BellatrixTest>(type: ParameterlessCtor<T>) {
    return {
        beforeEach: type.prototype[Symbols.BEFORE_EACH] as Method<BellatrixTest, typeof Symbols.BEFORE_EACH>,
        beforeAll: type.prototype[Symbols.BEFORE_ALL] as Method<BellatrixTest, typeof Symbols.BEFORE_ALL>,
        afterAll: type.prototype[Symbols.AFTER_ALL] as Method<BellatrixTest, typeof Symbols.AFTER_ALL>,
        afterEach: type.prototype[Symbols.AFTER_EACH] as Method<BellatrixTest, typeof Symbols.AFTER_EACH>,
    } as const;
}

let currentTestClass: BellatrixTest | undefined;
let globalConfigureBlock: Method<BellatrixTest, 'configure'> | undefined;

export function SuiteDecorator<T extends BellatrixTest>(target: ParameterlessCtor<T>): void {
    const testClass = target.prototype;
    defineSuiteMetadata(testClass.constructor);
    const testClassInstance = new (target.prototype.constructor as ParameterlessCtor<T>);
    const testClassSymbolMethods = getSymbolMethods(target);

    const testMethods = Object.getOwnPropertyNames(testClass).filter(method => typeof testClass[method] === 'function' && Reflect.hasMetadata(Symbols.TEST, testClass[method]));
    const title = target.name; // or passed as @Suite('title') or similar

    const tests: Map<string, unknown> = new Map;
    for (const testMethod of testMethods) {
        const testMetadata = getTestMetadata(testClass[testMethod], testClass);

        for (const [filterKey, filterValue] of Object.entries(testFilters)) {
            if (filterKey == 'suiteName') {
                if (Array.isArray(filterValue)) {
                    throw new Error('no more than one --suiteName argument allowed as it equals to AND operator, use regex');
                }

                if (!(new RegExp(String(filterValue), 'i').test(testMetadata[filterKey]))) {
                    testMetadata.shouldSkip = true;
                    break;
                }
            }

            if (filterKey == 'testName') {
                if (Array.isArray(filterValue)) {
                    throw new Error('no more than one --testName argument allowed as it equals to AND operator, use regex');
                }

                if (!(new RegExp(String(filterValue), 'i').test(testMetadata[filterKey]))) {
                    testMetadata.shouldSkip = true;
                    break;
                }
            } else {
                if (Array.isArray(filterValue)) {
                    let remainingMatches = filterValue.length;
                    filterValue.forEach(singleFilterValue => {
                        if (new RegExp(String(singleFilterValue), 'i').test(String(testMetadata.customData.get(filterKey)))) {
                            remainingMatches--;
                        }
                    });

                    if (remainingMatches > 0) {
                        testMetadata.shouldSkip = true;
                        break;
                    }
                } else if (!(new RegExp(String(filterValue), 'i').test(String(testMetadata.customData.get(filterKey))))) {
                    testMetadata.shouldSkip = true;
                    break;
                }
            }
        }

        const currentTest = async () => {
            try {
                await testClass[testMethod].call(testClassInstance);
            } catch (error) {
                if (error instanceof Error) {
                    testMetadata.error = error;
                    throw error;
                }
            }
        };

        Object.defineProperty(currentTest, 'name', { value: testMethod }); // !!! Important
        tests.set(testMethod, currentTest);
    }

    nativeLibrary.describe(title, () => {
        nativeLibrary.beforeAll(async () => await testClassSymbolMethods.beforeAll.call(testClassInstance), 0);

        nativeLibrary.beforeEach(async () => {
            const regex = new RegExp(`${title} > \\b(.*)`);
            const match = regex.exec(nativeLibrary.expect.getState().currentTestName ?? '');
            const currentTestName = (match?.length ?? 0) > 1 ? match![1] : '';
            setCurrentTest(currentTestName, testClassInstance[currentTestName as keyof T] as (...args: unknown[]) => (Promise<void> | void), testClass.constructor);
            await testClassSymbolMethods.beforeEach.call(testClassInstance);
        }, 0);

        nativeLibrary.afterEach(async () => {
            await testClassSymbolMethods.afterEach.call(testClassInstance);
            unsetCurrentTest(testClass.constructor);
        }, 0);

        nativeLibrary.afterAll(async () => await testClassSymbolMethods.afterAll.call(testClassInstance), 0);

        tests.forEach((testFunction, testName) => {
            const testMetadata = getTestMetadata(testClass[(testFunction as Function).name], testClass);
            if (testMetadata.shouldSkip) {
                nativeLibrary.test.skip(testName, { timeout: testSettings.testTimeout }, testFunction as never);
            } else if (testMetadata.only) {
                nativeLibrary.test.only(testName, { timeout: testSettings.testTimeout }, testFunction as never);
            } else {
                nativeLibrary.test(testName, { timeout: testSettings.testTimeout }, testFunction as never);
            }
        });
    });
}

function test<T extends BellatrixTest, K extends string>(target: T, key: K extends MethodNames<BellatrixTest> ? never : K): void;
function test(name: string, fn: TestFn<TestProps>): void;
function test<T extends BellatrixTest, K extends string>(nameOrTarget: unknown, fn: unknown): void {
    if (nameOrTarget instanceof BellatrixTest) {
        const target = nameOrTarget as T;
        const key = fn as K extends MethodNames<BellatrixTest> ? never : K;
        defineTestMetadata(target[key as keyof T] as (...args: unknown[]) => (Promise<void> | void), target.constructor as ParameterlessCtor<T>);
        return;
    }
    if (!currentTestClass) {
        throw Error('test cannot be called outside of describe block.');
    }

    if (globalConfigureBlock) {
        currentTestClass.constructor.prototype.configure = globalConfigureBlock;
    }

    const testFn = async () => await (fn as TestFn<TestProps>)(ServiceLocator.resolve(TestProps));
    Object.defineProperty(testFn, 'name', { value: nameOrTarget });
    currentTestClass.constructor.prototype[nameOrTarget as keyof T] = testFn;
    test(currentTestClass, nameOrTarget as string);
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
};
