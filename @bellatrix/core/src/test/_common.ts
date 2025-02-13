import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { CurrentTest, Method, Result, SuiteMetadata, TestMetadata } from '@bellatrix/core/types';
import { getMetadataFor } from '@bellatrix/core/utilities';

const beforeAll = Symbol('bellatrix:beforeAll');
const beforeEach = Symbol('bellatrix:beforeEach');
const afterEach = Symbol('bellatrix:afterEach');
const afterAll = Symbol('bellatrix:afterAll');
const testMetadata = Symbol('bellatrix:testMetadata');
const suiteMetadata = Symbol('bellatrix:suiteMetadata');
const currentTest = Symbol('bellatrix:currentTest');
const shouldSkip = Symbol('bellatrix:shouldSkip');
const testCaseArgs = Symbol('bellatrix:testCaseArgs');
const only = Symbol('bellatrix:only');
const hasTestDecorator = Symbol('bellatrix:isTest');
const singletons = Symbol('bellatrix:singletons');
const services = Symbol('bellatrix:services');
const namedServices = Symbol('bellatrix:namedServices');
const types = Symbol('bellatrix:types');
const namedTypes = Symbol('bellatrix:namedTypes');

export const Internal = {
    beforeAll,
    beforeEach,
    afterEach,
    afterAll,
    testMetadata,
    suiteMetadata,
    currentTest,
    shouldSkip,
    testCaseArgs,
    only,
    hasTestDecorator,
    singletons,
    services,
    namedServices,
    types,
    namedTypes,
} as const;

const testFilters: {
    testName?: string,
    suiteName?: string,
} & Record<string, string | string[]> = JSON.parse(process.env.BELLATRIX_TEST_FILTER ?? '{}');

type MetadataTypes = {
    [Internal.testMetadata]: TestMetadata,
    [Internal.suiteMetadata]: SuiteMetadata,
    [Internal.currentTest]: CurrentTest,
}

export const suiteMetadataStore: WeakMap<typeof BellatrixTest, SuiteMetadata> = new WeakMap;
export const testMetadataStore: WeakMap<Function, TestMetadata> = new WeakMap;
export const currentTestStore: WeakMap<typeof BellatrixTest, CurrentTest> = new WeakMap;

export function initMetadata<Type extends keyof MetadataTypes>(type: Type, source: Function): MetadataTypes[Type] {
    switch (type) {
        case Internal.testMetadata:
            return {
                testName: source.name,
                testMethod: source as (...args: never[]) => Result<void>,
                customData: new Map,
                [Internal.shouldSkip]: false,
                [Internal.only]: false,
                [Internal.hasTestDecorator]: false,
                [Internal.testCaseArgs]: [] as unknown[][],
                // we purposefully omit suiteName and suiteClass here
                // they MUST be set in the test framework's beforeTest
            } as MetadataTypes[Type];
        case Internal.suiteMetadata:
            return {
                suiteName: source.name,
                suiteClass: source as typeof BellatrixTest,
            } as MetadataTypes[Type];
        case Internal.currentTest:
            return {
                name: null,
                method: null,
            } as MetadataTypes[Type];
        default:
            throw Error(`Invalid metadata type: ${String(type)}.`);
    }
}

export function getFilteredTestsList<T extends BellatrixTest>(testClassInstance: T): Map<string, Method<BellatrixTest>> {
    const testClass = testClassInstance.constructor.prototype;
    const testMethodsNames = Object.getOwnPropertyNames(testClass)
        .filter(method => typeof testClass[method] === 'function' &&
            getMetadataFor(testClass[method])?.[Internal.hasTestDecorator]);

    const tests: Map<string, Method<BellatrixTest>> = new Map;
    for (const testMethodName of testMethodsNames) {
        const testMethod = testClass[testMethodName] as keyof Method<BellatrixTest>;
        const testMetadata = testMetadataStore.get(testMethod)!;

        for (const [filterKey, filterValue] of Object.entries(testFilters)) {
            if (!Array.isArray(filterValue)) {
                const filterPattern = new RegExp(
                    `${filterValue.endsWith('$') ? '' : '^'}${filterValue}${filterValue.startsWith('^') ? '' : '$'}`
                );

                switch (filterKey) {
                    case 'suiteName':
                        if (!testMetadata[filterKey]) {
                            throw new Error(`could not determine suite name of /${testMethodName}'.`);
                        }

                        if (!filterPattern.test(testMetadata[filterKey])) {
                            testMetadata[Internal.shouldSkip] = true;
                        }
                        break;
                    case 'testName':
                        if (!filterPattern.test(testMetadata[filterKey])) {
                            testMetadata[Internal.shouldSkip] = true;
                        }
                        break;
                    default:
                        if (Array.isArray(testMetadata.customData.get(filterKey))) {
                            if (((testMetadata.customData.get(filterKey)) as unknown[]).every(entry =>
                                typeof entry !== 'string' &&
                                typeof entry !== 'number' &&
                                typeof entry !== 'bigint' &&
                                typeof entry !== 'boolean'
                            )) {
                                testMetadata[Internal.shouldSkip] = true;
                                break;
                            }

                            if (!filterPattern.test(String(testMetadata.customData.get(filterKey)))) {
                                testMetadata[Internal.shouldSkip] = true;
                            }
                            break;

                        } else if (!Array.isArray(testMetadata.customData.get(filterKey)) &&
                            typeof testMetadata.customData.get(filterKey) !== 'string' &&
                            typeof testMetadata.customData.get(filterKey) !== 'number' &&
                            typeof testMetadata.customData.get(filterKey) !== 'bigint' &&
                            typeof testMetadata.customData.get(filterKey) !== 'boolean'
                        ) {
                            testMetadata[Internal.shouldSkip] = true;
                            break;
                        } else if (!(testMetadata.customData.get(filterKey) as unknown[]).every(entry => filterPattern.test(String(entry)))) {
                            testMetadata[Internal.shouldSkip] = true;
                        }
                        break;
                }

                break;
            }

            switch (filterKey) {
                case 'suiteName':
                    throw new Error('no more than one --suiteName argument allowed as it equals to AND operator, use regex.');
                case 'testName':
                    throw new Error('no more than one --testName argument allowed as it equals to AND operator, use regex');
                default: {
                    let remainingMatches = filterValue.length;
                    filterValue.forEach(singleFilterValue => {
                        if (!testMetadata.customData.get(filterKey)) return;

                        const filterPattern = new RegExp(
                            `${singleFilterValue.endsWith('$') ? '' : '^'}${singleFilterValue}${singleFilterValue.startsWith('^') ? '' : '$'}`
                        );

                        if (Array.isArray(testMetadata.customData.get(filterKey))) {
                            if ((testMetadata.customData.get(filterKey) as unknown[]).every(entry => filterPattern.test(String(entry)))) {
                                remainingMatches--;
                            }
                        } else if (filterPattern.test(String(testMetadata.customData.get(filterKey)))) {
                            remainingMatches--;
                        }
                    });

                    if (remainingMatches > 0) {
                        testMetadata[Internal.shouldSkip] = true;
                        break;
                    }
                }
            }
        }

        const currentTest = (async ({ }: object, ...args: unknown[]) => {
            try {
                await (testMethod as Function).apply(testClassInstance, args);
            } catch (error) {
                if (error instanceof Error) {
                    testMetadata.error = error;
                }

                throw error;
            }
        }) as keyof Method<BellatrixTest>;

        Object.defineProperty(currentTest, 'name', { value: testMethodName });
        testMetadataStore.set(currentTest, testMetadataStore.get(testMethod)!);
        tests.set(testMethodName, currentTest);
    }

    return tests;
}
