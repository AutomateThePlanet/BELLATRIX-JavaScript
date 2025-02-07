import inspector from 'inspector';

let isDebuggerAttached = false;
if (inspector.url() !== undefined && new URL(inspector.url()!).port === '12016' && !isDebuggerAttached) {
    inspector.waitForDebugger();
    isDebuggerAttached = true;
}

// WARNING: do not install @types/jasmine as it will flood the global scope with types that are not needed
// @ts-expect-error - jasmine-core does not have a declaration file
import jasmineModule from 'jasmine-core';
import 'reflect-metadata';

import { Symbols } from '@bellatrix/core/constants';
import { TestProps, defineSuiteMetadata, defineTestMetadata, getTestMetadata, setCurrentTest, unsetCurrentTest } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest, PluginExecutionEngine } from '@bellatrix/core/infrastructure';

import type { ConfigureFn, Method, MethodNames, ParameterlessCtor, TestFn } from '@bellatrix/core/types';

const nativeLibrary: JasmineModule = jasmineModule.noGlobals();
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

class CurrentSpecReporter {
    specStarted(result: unknown) {
        // @ts-expect-error - TODO: add type
        currentSpecName = result.description;
    }
}

// @ts-expect-error - WARNING: do not install @types/jasmine as it will flood the global scope with types that are not needed
jasmine.getEnv().addReporter(new CurrentSpecReporter());

let currentTestClass: BellatrixTest | undefined;
let currentSpecName: string | undefined;
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
        nativeLibrary.beforeAll(async () => await testClassSymbolMethods.beforeAll.call(testClassInstance));

        nativeLibrary.beforeEach(async () => {
            const currentTestName = currentSpecName!;
            setCurrentTest(currentTestName, testClassInstance[currentTestName as keyof T] as (...args: unknown[]) => (Promise<void> | void), testClass.constructor);
            await testClassSymbolMethods.beforeEach.call(testClassInstance);
        });

        nativeLibrary.afterEach(async () => {
            await testClassSymbolMethods.afterEach.call(testClassInstance);
            unsetCurrentTest(testClass.constructor);
            currentSpecName = undefined;
        });

        nativeLibrary.afterAll(async () => await testClassSymbolMethods.afterAll.call(testClassInstance));

        tests.forEach((testFunction, testName) => {
            const testMetadata = getTestMetadata(testClass[(testFunction as Function).name], testClass);
            if (testMetadata.shouldSkip) {
                nativeLibrary.xit(testName, testFunction as never, testSettings.testTimeout);
            } else if (testMetadata.only) {
                nativeLibrary.fit(testName, testFunction as never, testSettings.testTimeout);
            } else {
                nativeLibrary.it(testName, testFunction as never, testSettings.testTimeout);
            }
        });
    });
}

function test<T extends BellatrixTest, K extends string>(target: T, key: K extends MethodNames<BellatrixTest> ? never : K): void;
function test(name: string, fn: TestFn<TestProps>): void;
function test<T extends BellatrixTest, K extends string>(name: unknown, fn: unknown): void {
    if (name instanceof BellatrixTest) {
        const target = name as T;
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
    Object.defineProperty(testFn, 'name', { value: name });
    currentTestClass.constructor.prototype[name as keyof T] = testFn;
    test(currentTestClass, name as string);
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

// ######################################## TYPES ########################################

type JasmineModule = {
    /**
     * Run some shared setup once before all of the specs in the describe are run.
     * Note: Be careful, sharing the setup from a beforeAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @param action Function that contains the code to setup your specs.
     * @param timeout Custom timeout for an async beforeAll.
     */
    beforeAll: (action: () => void, timeout?: number) => void;

    /**
     * Run some shared teardown once after all of the specs in the describe are run.
     * Note: Be careful, sharing the teardown from a afterAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @param action Function that contains the code to teardown your specs.
     * @param timeout Custom timeout for an async afterAll
     */
    afterAll: (action: () => void, timeout?: number) => void;

    /**
     * Create a group of specs (often called a suite).
     * @param description Textual description of the group
     * @param specDefinitions Function for Jasmine to invoke that will define inner suites a specs
     */
    describe: (description: string, specDefinitions: () => void) => void;

    /**
     * Run some shared setup before each of the specs in the describe in which it is called.
     * @param action Function that contains the code to setup your specs.
     * @param timeout Custom timeout for an async beforeEach.
     */
    beforeEach: (action: () => void, timeout?: number) => void;

    /**
     * Run some shared teardown after each of the specs in the describe in which it is called.
     * @param action Function that contains the code to teardown your specs.
     * @param timeout Custom timeout for an async afterEach.
     */
    afterEach: (action: () => void, timeout?: number) => void;

    /**
     * Define a single spec. A spec should contain one or more expectations that test the state of the code.
     * A spec whose expectations all succeed will be passing and a spec with any failures will fail.
     * @param expectation Textual description of what this spec is checking
     * @param assertion Function that contains the code of your test. If not provided the test will be pending.
     * @param timeout Custom timeout for an async spec.
     */
    it: (expectation: string, assertion?: () => void, timeout?: number) => void;

    /**
     * A focused `it`. If suites or specs are focused, only those that are focused will be executed.
     * @param expectation Textual description of what this spec is checking
     * @param assertion Function that contains the code of your test. If not provided the test will be pending.
     * @param timeout Custom timeout for an async spec.
     */
    fit: (expectation: string, assertion?: () => void, timeout?: number) => void;

    /**
     * A temporarily disabled `it`. The spec will report as pending and will not be executed.
     * @param expectation Textual description of what this spec is checking
     * @param assertion Function that contains the code of your test. If not provided the test will be pending.
     * @param timeout Custom timeout for an async spec.
     */
    xit: (expectation: string, assertion?: () => void, timeout?: number) => void;
};
