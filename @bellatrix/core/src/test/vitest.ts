import * as nativeLibrary from 'vitest';

import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { getMetadataFor } from '@bellatrix/core/utilities';

import type { Method, ParameterlessCtor, Result } from '@bellatrix/core/types';

import {
    Internal,
    currentTestStore,
    getFilteredTestsList,
    initMetadata,
    testMetadataStore,
} from './_common';

const testSettings = BellatrixSettings.get().frameworkSettings.testSettings;

function getSymbolMethods<T extends BellatrixTest>(type: ParameterlessCtor<T>) {
    return {
        beforeEach: type.prototype[Internal.beforeEach] as Method<BellatrixTest, typeof Internal.beforeEach>,
        beforeAll: type.prototype[Internal.beforeAll] as Method<BellatrixTest, typeof Internal.beforeAll>,
        afterAll: type.prototype[Internal.afterAll] as Method<BellatrixTest, typeof Internal.afterAll>,
        afterEach: type.prototype[Internal.afterEach] as Method<BellatrixTest, typeof Internal.afterEach>,
    } as const;
}

export function SuiteDecorator<
    This extends BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>
>(target: Class, context: ClassDecoratorContext<Class>): void {
    getMetadataFor(target); // init

    const testClassInstance = new (target.prototype.constructor as ParameterlessCtor<This>);
    const testClassSymbolMethods = getSymbolMethods(target);
    const testMethods = getFilteredTestsList(testClassInstance);

    const title = context.name ?? target.name;

    nativeLibrary.describe(title, () => {
        nativeLibrary.beforeAll(async () => await testClassSymbolMethods.beforeAll.apply(testClassInstance), 0);

        nativeLibrary.beforeEach(async () => {
            const regex = new RegExp(`${title} > \\b(.*)`);
            const match = regex.exec(nativeLibrary.expect.getState().currentTestName ?? '');
            const currentTestName = (match?.length ?? 0) > 1 ? match![1] : '';

            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(Internal.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            const testCaseRegex = /[\w]+(?=\()/;
            currentTest.name = currentTestName;
            const methodNameMatch = currentTestName.match(testCaseRegex);
            const methodName = methodNameMatch ? methodNameMatch[0] : currentTestName;
            currentTest.method = testClassInstance[methodName as keyof This] as (...args: never[]) => Result<void>;

            const testMetadata = getMetadataFor(currentTest.method);
            testMetadata.suiteName = title;
            testMetadata.suiteClass = target;

            await testClassSymbolMethods.beforeEach.apply(testClassInstance);
        }, 0);

        nativeLibrary.afterEach(async () => {
            await testClassSymbolMethods.afterEach.apply(testClassInstance);
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(Internal.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            currentTest.name = null;
            currentTest.method = null;
        }, 0);

        nativeLibrary.afterAll(async () => await testClassSymbolMethods.afterAll.apply(testClassInstance), 0);

        testMethods.forEach((testFunction, testName) => {
            const testMetadata = getMetadataFor(testFunction);

            if (testMetadata[Internal.testCaseArgs].length > 0) {
                let index = 1;
                nativeLibrary.describe(testName, () => {
                    for (const args of testMetadata[Internal.testCaseArgs].toReversed()) {
                        const parametrizedTestFunction = (testFunction as Function).bind(null, { }, ...args);
                        testMetadataStore.set(parametrizedTestFunction, testMetadata);

                        if (testMetadata[Internal.shouldSkip]) {
                            nativeLibrary.test.skip(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        } else if (testMetadata[Internal.only]) {
                            nativeLibrary.test.only(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        } else {
                            nativeLibrary.test(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        }
                        index++;
                    }
                });
            } else {
                if (testMetadata[Internal.shouldSkip]) {
                    nativeLibrary.test.skip(testName, testFunction as never, testSettings.testTimeout);
                } else if (testMetadata[Internal.only]) {
                    nativeLibrary.test.only(testName, testFunction as never, testSettings.testTimeout);
                } else {
                    nativeLibrary.test(testName, testFunction as never, testSettings.testTimeout);
                }
            }
        });
    });
}

function TestDecorator<
    This extends BellatrixTest = BellatrixTest,
    ClassMethod extends Method<This> = Method<This>
>(target: ClassMethod, _context: ClassMethodDecoratorContext<This, ClassMethod>): void {
    const testMetadata = getMetadataFor(target);
    testMetadata[Internal.hasTestDecorator] = true;

    return;
}

export {
    TestDecorator as test,
    TestDecorator as Test,
    SuiteDecorator as suite,
    SuiteDecorator as Suite,
    SuiteDecorator as testClass,
    SuiteDecorator as TestClass,
};
