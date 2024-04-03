import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { TestProps } from '@bellatrix/core/test/props';

import type { BellatrixTestMethods } from '@bellatrix/core/test/props';

ServiceLocator.registerType(BellatrixTest);
ServiceLocator.registerTransient(TestProps, class extends TestProps { static override get name() { return 'TestProps' }});

let testFramework;

try {
    testFramework = await import('./' + BellatrixSettings.get().frameworkSettings.testSettings.testFramework);
} catch {
    testFramework = await import('./' + BellatrixSettings.get().frameworkSettings.testSettings.testFramework) + '.js';
}

const { configure, describe, beforeAll, beforeEach, afterAll, afterEach, test, it, Suite, suite, TestClass, Test }: BellatrixTestMethods<TestProps, BellatrixTest> = testFramework;

export { configure, describe, beforeAll, beforeEach, afterAll, afterEach, test, it, Suite, suite, TestClass, Test };