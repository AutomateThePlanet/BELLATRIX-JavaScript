import { BellatrixTest } from '@bellatrix/core/infrastructure';

import { Internal } from '../test/_common';

import type {
    TestDecorator,
    TestSuiteDecorator,
    Result,
} from '@bellatrix/core/types';

export type BellatrixTestMethods<BaseTest extends BellatrixTest> = {
    Test: TestDecorator<BaseTest>;
    test: TestDecorator<BaseTest>;
    Suite: TestSuiteDecorator<BaseTest>;
    suite: TestSuiteDecorator<BaseTest>;
    TestClass: TestSuiteDecorator<BaseTest>;
    testClass: TestSuiteDecorator<BaseTest>;
}

export type TestMetadata = {
    testName: string;
    suiteName: string;
    testMethod: (...args: never[]) => Result<void>;
    suiteClass: typeof BellatrixTest;
    customData: Map<string, unknown>;
    error?: Error;
    [Internal.testCaseArgs]: unknown[][],
    [Internal.shouldSkip]: boolean,
    [Internal.only]: boolean,
    [Internal.hasTestDecorator]: boolean;
}

export type SuiteMetadata = {
    suiteName: string;
    suiteClass: typeof BellatrixTest;
}

export type CurrentTest = {
    name: string | null;
    method: ((...args: never[]) => Result<void>) | null;
}
