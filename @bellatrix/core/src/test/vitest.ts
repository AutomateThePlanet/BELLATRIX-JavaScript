import * as nativeLibrary from 'vitest';

import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { DecoratorUtilities } from '@bellatrix/core/utilities';

import type { Method, ParameterlessCtor, Result } from '@bellatrix/core/types';

import {
    BellatrixSymbol,
    currentTestStore,
    getFilteredTestsList,
    initMetadata,
    testMetadataStore,
} from './_common';

const testSettings = BellatrixSettings.get().frameworkSettings.testSettings;

function getSymbolMethods<T extends BellatrixTest>(type: ParameterlessCtor<T>) {
    return {
        beforeEach: type.prototype[BellatrixSymbol.beforeEach] as Method<BellatrixTest, typeof BellatrixSymbol.beforeEach>,
        beforeAll: type.prototype[BellatrixSymbol.beforeAll] as Method<BellatrixTest, typeof BellatrixSymbol.beforeAll>,
        afterAll: type.prototype[BellatrixSymbol.afterAll] as Method<BellatrixTest, typeof BellatrixSymbol.afterAll>,
        afterEach: type.prototype[BellatrixSymbol.afterEach] as Method<BellatrixTest, typeof BellatrixSymbol.afterEach>,
    } as const;
}

export function SuiteDecorator<
    This extends BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>
>(target: Class, context: ClassDecoratorContext<Class>): void {
    DecoratorUtilities.getMetadata(target); // init

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
                currentTestStore.set(target, initMetadata(BellatrixSymbol.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            const testCaseRegex = /[\w]+(?=\()/;
            currentTest.name = currentTestName;
            const methodNameMatch = currentTestName.match(testCaseRegex);
            const methodName = methodNameMatch ? methodNameMatch[0] : currentTestName;
            currentTest.method = testClassInstance[methodName as keyof This] as (...args: never[]) => Result<void>;

            const testMetadata = DecoratorUtilities.getMetadata(currentTest.method);
            testMetadata.suiteName = title;
            testMetadata.suiteClass = target;

            await testClassSymbolMethods.beforeEach.apply(testClassInstance);
        }, 0);

        nativeLibrary.afterEach(async () => {
            await testClassSymbolMethods.afterEach.apply(testClassInstance);
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(BellatrixSymbol.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            currentTest.name = null;
            currentTest.method = null;
        }, 0);

        nativeLibrary.afterAll(async () => await testClassSymbolMethods.afterAll.apply(testClassInstance), 0);

        testMethods.forEach((testFunction, testName) => {
            const testMetadata = DecoratorUtilities.getMetadata(testFunction);

            if (testMetadata[BellatrixSymbol.testCaseArgs].length > 0) {
                let index = 1;
                nativeLibrary.describe(testName, () => {
                    for (const args of testMetadata[BellatrixSymbol.testCaseArgs].toReversed()) {
                        const parametrizedTestFunction = (testFunction as Function).bind(null, { }, ...args);
                        testMetadataStore.set(parametrizedTestFunction, testMetadata);

                        if (testMetadata[BellatrixSymbol.shouldSkip]) {
                            nativeLibrary.test.skip(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        } else if (testMetadata[BellatrixSymbol.only]) {
                            nativeLibrary.test.only(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        } else {
                            nativeLibrary.test(`${index}. ${testName}(${args.join(', ')})`, parametrizedTestFunction, testSettings.testTimeout);
                        }
                        index++;
                    }
                });
            } else {
                if (testMetadata[BellatrixSymbol.shouldSkip]) {
                    nativeLibrary.test.skip(testName, testFunction as never, testSettings.testTimeout);
                } else if (testMetadata[BellatrixSymbol.only]) {
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
    const testMetadata = DecoratorUtilities.getMetadata(target);
    testMetadata[BellatrixSymbol.hasTestDecorator] = true;

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
