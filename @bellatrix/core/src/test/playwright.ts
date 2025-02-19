import inspector from 'inspector';

let isDebuggerAttached = false;
if (inspector.url() !== undefined && new URL(inspector.url()!).port === '12016' && !isDebuggerAttached) {
    inspector.waitForDebugger();
    isDebuggerAttached = true;
}

import * as nativeLibrary from '@playwright/test';

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

    nativeLibrary.defineConfig({ timeout: testSettings.testTimeout });

    const title = context.name ?? target.name;
    nativeLibrary.test.describe(title, () => {
        nativeLibrary.test.beforeAll(async () => await testClassSymbolMethods.beforeAll.apply(testClassInstance));

        nativeLibrary.test.beforeEach(async ({ }, testInfo) => {
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(Internal.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            const testCaseRegex = /[\w]+(?=\()/;
            currentTest.name = testInfo.title;
            const methodNameMatch = testInfo.title.match(testCaseRegex);
            const methodName = methodNameMatch ? methodNameMatch[0] : testInfo.title;
            currentTest.method = testClassInstance[methodName as keyof This] as (...args: never[]) => Result<void>;

            const testMetadata = getMetadataFor(currentTest.method);
            testMetadata.suiteName = title;
            testMetadata.suiteClass = target;

            await testClassSymbolMethods.beforeEach.apply(testClassInstance);
        });

        nativeLibrary.test.afterEach(async ({ }, _) => {
            await testClassSymbolMethods.afterEach.apply(testClassInstance);
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(Internal.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            currentTest.name = null;
            currentTest.method = null;
        });

        nativeLibrary.test.afterAll(async () => await testClassSymbolMethods.afterAll.apply(testClassInstance));

        testMethods.forEach((testFunction, testName) => {
            const testMetadata = getMetadataFor(testFunction);

            if (testMetadata[Internal.testCaseArgs].length > 0) {
                let index = 1;
                nativeLibrary.test.describe(testName, () => {
                    for (const args of testMetadata[Internal.testCaseArgs].toReversed()) {
                        const parametrizedTestFunction = (testFunction as Function).bind(null, { }, ...args);
                        testMetadataStore.set(parametrizedTestFunction, testMetadata);

                        if (testMetadata[Internal.shouldSkip]) {
                            nativeLibrary.test.skip(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction);
                        } else if (testMetadata[Internal.only]) {
                            nativeLibrary.test.only(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction);
                        } else {
                            nativeLibrary.test(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction);
                        }
                        index++;
                    }
                });
            } else {
                if (testMetadata[Internal.shouldSkip]) {
                    nativeLibrary.test.skip(testName, testFunction as never);
                } else if (testMetadata[Internal.only]) {
                    nativeLibrary.test.only(testName, testFunction as never);
                } else {
                    nativeLibrary.test(testName, testFunction as never);
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
