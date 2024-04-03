import { TestProps, type BellatrixTestMethods } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { App, WebTest } from '@bellatrix/web/infrastructure';

import type { BrowserAutomationToolType, BrowserType, ExecutionType } from '@bellatrix/web/types';

class WebTestProps extends TestProps {
    app = () => ServiceLocator.resolve(App);
}

ServiceLocator.registerType(BellatrixTest, WebTest);
ServiceLocator.registerTransient(TestProps, WebTestProps);

import * as bellatrixTest from '@bellatrix/core/test';

const { configure, describe, beforeAll, beforeEach, afterAll, afterEach, test, it, Suite, suite, TestClass, Test } = bellatrixTest as unknown as BellatrixTestMethods<WebTestProps, WebTest>;
export { configure, describe, beforeAll, beforeEach, afterAll, afterEach, test, it, Suite, suite, TestClass, Test };

declare module '@bellatrix/core/types' {
    interface BellatrixConfiguration {
        webSettings: WebSettings;
    }
}

interface WebSettings {
    timeoutSettings: TimeoutSettings;
    actionSettings: ActionSettings;
    executionSettings: ExecutionSettings;
    remoteExecutionSettings: RemoteExecutionSettings;
}

interface TimeoutSettings {
    findElementTimeout: number,
    validationTimeout: number,
    pageLoadTimeout: number,
    waitForAjaxTimeout: number,
    scriptTimeout: number,
    sleepInterval: number
}

interface ActionSettings {
    delayBeforeAction: number;
}

interface ExecutionSettings {
    browserAutomationTool: BrowserAutomationToolType;
    browser: BrowserType,
    headless: boolean,
    viewport?: { width: number, height: number },
    startMaximized: boolean,
    executionType: ExecutionType,
    baseUrl: string
}

interface RemoteExecutionSettings {
    remoteUrl: string,
    user: string, // rename
    key: string // rename
}