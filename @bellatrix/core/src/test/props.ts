import type { ConfigureFn, TestDecoratorImpl as TestDecorator, TestFn, TestFunction, TestSuiteDecorator } from '@bellatrix/core/types';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Symbols } from '@bellatrix/core/constants';
import 'reflect-metadata';

export type BellatrixTestMethods<T extends TestProps, BaseTest extends BellatrixTest> = {
    configure: (fn: ConfigureFn) => void;
    describe: (title: string, fn: () => void) => void;
    beforeAll: (fn: TestFn<T>) => void;
    beforeEach: (fn: TestFn<T>) => void;
    afterAll: (fn: TestFn<T>) => void;
    afterEach: (fn: TestFn<T>) => void;
    test: TestFunction<T> & TestDecorator<BaseTest>;
    it: TestFunction<T>;
    Suite: TestSuiteDecorator<BaseTest>;
    suite: TestSuiteDecorator<BaseTest>;
    TestClass: TestSuiteDecorator<BaseTest>;
    Test: TestDecorator<BaseTest>;
}

export abstract class TestProps {}

export type TestMetadata = {
    testName: string;
    suiteName: string;
    testMethod: (...args: unknown[]) => (Promise<void> | void);
    suiteClass: typeof BellatrixTest;
    shouldSkip: boolean,
    only: boolean,
    error?: Error;
    customData: Map<string | symbol, unknown>;
}

export type SuiteMetadata = {
    suiteName: string;
    suiteClass: typeof BellatrixTest;
    customData: Map<string | symbol, unknown>;
}

export type CurrentTest = {
    name: string;
    method: (...args: unknown[]) => (Promise<void> | void);
}

export function getTestMetadata(testMethod: (...args: unknown[]) => (Promise<void> | void), suiteClass: typeof BellatrixTest): TestMetadata {
    let metadata: TestMetadata | null = null;

    try {
        metadata = Reflect.getMetadata(Symbols.TEST, testMethod);
    } catch {
        // ignore
    }

    if (metadata) {
        return metadata;
    } else {
        defineTestMetadata(testMethod, suiteClass);
        return Reflect.getMetadata(Symbols.TEST, testMethod);
    }
}

export function getSuiteMetadata(suiteClass: typeof BellatrixTest): TestMetadata {
    return Reflect.getMetadata(Symbols.SUITE, suiteClass);
}

export function setCurrentTest(testName: string, testMethod: (...args: unknown[]) => (Promise<void> | void), suiteClass: typeof BellatrixTest): void {
    Reflect.defineMetadata(Symbols.CURRENT_TEST, { name: testName, method: testMethod }, suiteClass.constructor);
}

export function unsetCurrentTest(suiteClass: typeof BellatrixTest): void {
    Reflect.deleteMetadata(Symbols.CURRENT_TEST, suiteClass.constructor);
}

export function getCurrentTest(suiteClass: typeof BellatrixTest): CurrentTest {
    return Reflect.getMetadata(Symbols.CURRENT_TEST, suiteClass.constructor);
}

export function defineTestMetadata(testMethod: (...args: unknown[]) => (Promise<void> | void), suiteClass: typeof BellatrixTest) {
    if (!Reflect.getMetadata(Symbols.TEST, testMethod)) {
        Reflect.defineMetadata(Symbols.TEST, { testName: testMethod.name, suiteName: suiteClass.name, testMethod: testMethod, suiteClass: suiteClass, shouldSkip: false, only: false, customData: new Map } satisfies TestMetadata, testMethod); // <<<<<< !!!!!!! DEFINE TEST METADATA
    }
}

export function defineSuiteMetadata(suiteClass: typeof BellatrixTest) {
    Reflect.defineMetadata(Symbols.SUITE, { suiteName: suiteClass.name, suiteClass, customData: new Map } satisfies SuiteMetadata, suiteClass);
}

// { testName: key, suiteName: target.constructor, testMethod: target[key], suiteClass: target.constructor }
