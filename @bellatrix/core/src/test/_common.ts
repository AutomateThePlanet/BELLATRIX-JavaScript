import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { CurrentTest, Method, Result, SuiteMetadata, TestMetadata } from '@bellatrix/core/types';
import { DecoratorUtilities } from '@bellatrix/core/utilities';

const beforeAll = Symbol('bellatrix:beforeAll');
const beforeEach = Symbol('bellatrix:beforeEach');
const afterEach = Symbol('bellatrix:afterEach');
const afterAll = Symbol('bellatrix:afterAll');
const testMetadata = Symbol('bellatrix:testMetadata');
const suiteMetadata = Symbol('bellatrix:suiteMetadata');
const currentTest = Symbol('bellatrix:currentTest');
const hasTestDecorator = Symbol('bellatrix:isTest');

export const BellatrixSymbol = {
    beforeAll,
    beforeEach,
    afterEach,
    afterAll,
    testMetadata,
    suiteMetadata,
    currentTest,
    hasTestDecorator,
} as const;

const testFilters: {
    testName?: string,
    suiteName?: string,
} & Record<string, string | string[]> = JSON.parse(process.env.BELLATRIX_TEST_FILTER ?? '{}');

type MetadataTypes = {
    [BellatrixSymbol.testMetadata]: TestMetadata,
    [BellatrixSymbol.suiteMetadata]: SuiteMetadata,
    [BellatrixSymbol.currentTest]: CurrentTest,
}

export const suiteMetadataStore: WeakMap<typeof BellatrixTest, SuiteMetadata> = new WeakMap;
export const testMetadataStore: WeakMap<Function, TestMetadata> = new WeakMap;
export const currentTestStore: WeakMap<typeof BellatrixTest, CurrentTest> = new WeakMap;

export function initMetadata<Type extends keyof MetadataTypes>(type: Type, source: Function): MetadataTypes[Type] {
    switch (type) {
        case BellatrixSymbol.testMetadata:
            return {
                testName: source.name,
                testMethod: source as (...args: never[]) => Result<void>,
                shouldSkip: false,
                only: false,
                customData: new Map,
                [BellatrixSymbol.hasTestDecorator]: false,
                // we purposefully omit suiteName and suiteClass here
                // they MUST be set in the test framework's beforeTest
            } as MetadataTypes[Type];
        case BellatrixSymbol.suiteMetadata:
            return {
                suiteName: source.name,
                suiteClass: source as typeof BellatrixTest,
            } as MetadataTypes[Type];
        case BellatrixSymbol.currentTest:
            return {
                name: null,
                method: null,
            } as MetadataTypes[Type];
        default:
            throw Error(`Invalid metadata type: ${String(type)}.`);
    }
}

export function getFilteredTestsList(testClassInstance: BellatrixTest): Map<string, Method<BellatrixTest>> {
    const testClass = testClassInstance.constructor.prototype;
    const testMethodsNames = Object.getOwnPropertyNames(testClass)
        .filter(method => typeof testClass[method] === 'function' &&
            DecoratorUtilities.getMetadata(testClass[method])?.[BellatrixSymbol.hasTestDecorator]);

    const tests: Map<string, Method<BellatrixTest>> = new Map;
    for (const testMethodName of testMethodsNames) {
        const testMethod = testClass[testMethodName];
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
                            testMetadata.shouldSkip = true;
                        }
                        break;
                    case 'testName':
                        if (!filterPattern.test(testMetadata[filterKey])) {
                            testMetadata.shouldSkip = true;
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
                                testMetadata.shouldSkip = true;
                                break;
                            }

                            if (!filterPattern.test(String(testMetadata.customData.get(filterKey)))) {
                                testMetadata.shouldSkip = true;
                            }
                            break;

                        } else if (!Array.isArray(testMetadata.customData.get(filterKey)) &&
                            typeof testMetadata.customData.get(filterKey) !== 'string' &&
                            typeof testMetadata.customData.get(filterKey) !== 'number' &&
                            typeof testMetadata.customData.get(filterKey) !== 'bigint' &&
                            typeof testMetadata.customData.get(filterKey) !== 'boolean'
                        ) {
                            testMetadata.shouldSkip = true;
                            break;
                        } else if (!(testMetadata.customData.get(filterKey) as unknown[]).every(entry => filterPattern.test(String(entry)))) {
                            testMetadata.shouldSkip = true;
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
                        testMetadata.shouldSkip = true;
                        break;
                    }
                }
            }
        }

        const currentTest = async () => {
            try {
                await (testMethod as Function).apply(testClassInstance);
            } catch (error) {
                if (error instanceof Error) {
                    testMetadata.error = error;
                }

                throw error;
            }
        };

        Object.defineProperty(currentTest, 'name', { value: testMethodName });
        testMetadataStore.set(currentTest, testMetadataStore.get(testMethod)!);
        tests.set(testMethodName, currentTest);
    }

    return tests;
}
