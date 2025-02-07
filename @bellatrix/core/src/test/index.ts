import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { ServiceLocator } from '@bellatrix/core/utilities';

import type { BellatrixTestMethods } from '@bellatrix/core/types';

ServiceLocator.registerType(BellatrixTest);

let testFramework;

try {
    testFramework = await import('./' + BellatrixSettings.get().frameworkSettings.testSettings.testFramework);
} catch {
    testFramework = await import('./' + BellatrixSettings.get().frameworkSettings.testSettings.testFramework) + '.js';
}

const { Test, test, Suite, suite, TestClass, testClass }: BellatrixTestMethods<BellatrixTest> = testFramework;

export { Test, test, Suite, suite, TestClass, testClass };
