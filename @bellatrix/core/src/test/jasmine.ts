// @ts-ignore
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

function getSymbolMethods<T extends BellatrixTest>(type: ParameterlessCtor<T>) {
    return {
        beforeEach: type.prototype[Symbols.beforeEach] as Method<BellatrixTest, typeof Symbols.beforeEach>,
        beforeAll: type.prototype[Symbols.beforeAll] as Method<BellatrixTest, typeof Symbols.beforeAll>,
        afterAll: type.prototype[Symbols.afterAll] as Method<BellatrixTest, typeof Symbols.afterAll>,
        afterEach: type.prototype[Symbols.afterEach] as Method<BellatrixTest, typeof Symbols.afterEach>,
    } as const;
}


class CurrentSpecReporter {
    specStarted(result: any) { // add type
        currentSpecName = result.description;
    }
}

// @ts-ignore // do not install @types/jasmine as it will flood the global scope with types that are not needed
jasmine.getEnv().addReporter(new CurrentSpecReporter());

let currentTestClass: BellatrixTest | undefined;
let currentSpecName: string | undefined;
let globalConfigureBlock: Method<BellatrixTest, 'configure'> | undefined;

export function SuiteDecorator<T extends BellatrixTest>(target: ParameterlessCtor<T>): void {
    const testClass = target.prototype;
    defineSuiteMetadata(testClass.constructor);
    const testClassInstance = new (target.prototype.constructor as ParameterlessCtor<T>);
    const testClassSymbolMethods = getSymbolMethods(target);

    const testMethods = Object.getOwnPropertyNames(testClass).filter(method => typeof testClass[method] === 'function' && Reflect.hasMetadata(Symbols.test, testClass[method]));
    const title = target.name; // or passed as @Suite('title') or similar

    nativeLibrary.describe(title, () => {
        nativeLibrary.beforeAll(async () => await testClassSymbolMethods.beforeAll.call(testClassInstance));

        nativeLibrary.beforeEach(async () => {
            const currentTestName = currentSpecName!;
            // @ts-ignore
            setCurrentTest(currentTestName, testClassInstance[currentTestName], testClass.constructor);
            await testClassSymbolMethods.beforeEach.call(testClassInstance);
        });

        nativeLibrary.afterEach(async () => {
            await testClassSymbolMethods.afterEach.call(testClassInstance);
            unsetCurrentTest(testClass.constructor);
            currentSpecName = undefined;
        });

        nativeLibrary.afterAll(async () => await testClassSymbolMethods.afterAll.call(testClassInstance));

        for (const testMethod of testMethods) {
            nativeLibrary.it(testMethod, async () => {
                try {
                    await testClass[testMethod].call(testClassInstance);
                } catch (error) {
                    if (error instanceof Error) {
                        getTestMetadata(testClass[testMethod]).error = error;
                        throw error;
                    }
                }
            }, testSettings.testTimeout!);
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

// ######################################## TYPES ########################################

type JasmineModule = {
    /**
     * Run some shared setup once before all of the specs in the {@link describe} are run.
     *
     * _Note:_ Be careful, sharing the setup from a beforeAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @name beforeAll
     * @since 2.1.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeAll.
     * @see async
     */
    beforeAll: (fn: () => void, timeout?: number) => void;
  
    /**
     * Run some shared teardown once after all of the specs in the {@link describe} are run.
     *
     * _Note:_ Be careful, sharing the teardown from a afterAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @name afterAll
     * @since 2.1.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterAll.
     * @see async
     */
    afterAll: (fn: () => void, timeout?: number) => void;
  
    /**
     * Create a group of specs (often called a suite).
     *
     * Calls to `describe` can be nested within other calls to compose your suite as a tree.
     * @name describe
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites and specs
     */
    describe: (description: string, specDefinitions: () => void) => void;
  
    /**
     * Run some shared setup before each of the specs in the {@link describe} in which it is called.
     * @name beforeEach
     * @since 1.3.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeEach.
     * @see async
     */
    beforeEach: (fn: () => void, timeout?: number) => void;
  
    /**
     * Run some shared teardown after each of the specs in the {@link describe} in which it is called.
     * @name afterEach
     * @since 1.3.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterEach.
     * @see async
     */
    afterEach: (fn: () => void, timeout?: number) => void;
  
    /**
     * Define a single spec. A spec should contain one or more {@link expect|expectations} that test the state of the code.
     *
     * A spec whose expectations all succeed will be passing and a spec with any failures will fail.
     * The name `it` is a pronoun for the test target, not an abbreviation of anything. It makes the
     * spec more readable by connecting the function name `it` and the argument `description` as a
     * complete sentence.
     * @name it
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of what this spec is checking
     * @param {implementationCallback} [testFunction] Function that contains the code of your test. If not provided the test will be `pending`.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async spec.
     * @see async
     */
    it: (description: string, testFunction?: () => void, timeout?: number) => void;
};
