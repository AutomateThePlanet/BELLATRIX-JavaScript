import inspector from 'inspector';

let isDebuggerAttached = false;
if (inspector.url() !== undefined && new URL(inspector.url()!).port === '12016' && !isDebuggerAttached) {
    inspector.waitForDebugger();
    isDebuggerAttached = true;
}

import * as nativeLibrary from '@playwright/test';

import { BellatrixSettings } from '@bellatrix/core/settings';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { DecoratorUtilities } from '@bellatrix/core/utilities';

import type { Method, ParameterlessCtor, Result } from '@bellatrix/core/types';

import {
    BellatrixSymbol,
    currentTestStore,
    getFilteredTestsList,
    initMetadata,
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

    nativeLibrary.defineConfig({ timeout: testSettings.testTimeout });

    const title = context.name ?? target.name;
    nativeLibrary.test.describe(title, () => {
        nativeLibrary.test.beforeAll(async () => await testClassSymbolMethods.beforeAll.apply(testClassInstance));

        nativeLibrary.test.beforeEach(async ({ }, testInfo) => {
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(BellatrixSymbol.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            currentTest.name = testInfo.title;
            currentTest.method = testClassInstance[testInfo.title as keyof This] as (...args: never[]) => Result<void>;

            const testMetadata = DecoratorUtilities.getMetadata(currentTest.method);
            testMetadata.suiteName = title;
            testMetadata.suiteClass = target;

            await testClassSymbolMethods.beforeEach.apply(testClassInstance);
        });

        nativeLibrary.test.afterEach(async ({ }, _) => {
            await testClassSymbolMethods.afterEach.apply(testClassInstance);
            if (!currentTestStore.has(target)) {
                currentTestStore.set(target, initMetadata(BellatrixSymbol.currentTest, target));
            }

            const currentTest = currentTestStore.get(target)!;
            currentTest.name = null;
            currentTest.method = null;
        });

        nativeLibrary.test.afterAll(async () => await testClassSymbolMethods.afterAll.apply(testClassInstance));

        testMethods.forEach((testFunction, testName) => {
            const testMetadata = DecoratorUtilities.getMetadata(testFunction);
            if (testMetadata.shouldSkip) {
                nativeLibrary.test.skip(testName, testFunction as never);
            } else if (testMetadata.only) {
                nativeLibrary.test.only(testName, testFunction as never);
            } else {
                nativeLibrary.test(testName, testFunction as never);
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
