import { registerType } from '@bellatrix/core/utilities';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { WebTest } from '@bellatrix/web/infrastructure';

import type { BellatrixTestMethods, ubyte } from '@bellatrix/core/types';

import type { BrowserControllerType, BrowserType, ExecutionType } from '@bellatrix/web/types';

registerType(BellatrixTest, WebTest);

import * as bellatrixTest from '@bellatrix/core/test';

const { Test, test, Suite, suite, TestClass, testClass } = bellatrixTest as unknown as BellatrixTestMethods<WebTest>;
export { Test, test, Suite, suite, TestClass, testClass };

declare module '@bellatrix/core/types' {
    interface BellatrixConfiguration {
        webSettings: WebSettings;
    }
}

interface WebSettings {
    timeoutSettings: TimeoutSettings;
    actionSettings: ActionSettings;
    executionSettings: ExecutionSettings;
    remoteExecutionSettings?: RemoteExecutionSettings;
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
    browserController: BrowserControllerType;
    browser: BrowserType,
    headless: boolean,
    viewport?: { width: number, height: number },
    startMaximized?: boolean,
    executionType: ExecutionType,
    baseUrl: string
}

type RemoteExecutionSettings = {
    provider: 'Selenium Grid' | 'Selenoid',
    remoteUrl: string,
    capabilities: Capabilities,
    headers?: Record<string, string>,
} | {
    provider: 'LambdaTest' | 'BrowserStack',
    capabilities: Capabilities,
    username: string,
    accessKey: string,
}

type VendorSpecificKeys = Record<`${string}.${string}` | `${string}:${string}`, unknown>;

type Capabilities = VendorSpecificKeys & {
    browserName: string,
    browserVersion?: string,
    platformName?: string,
    acceptInsecureCerts?: boolean,
    pageLoadStrategy?: 'none' | 'eager' | 'normal',
    proxy?: Proxy,
    setWindowRect?: string,
    timeouts?: Timeouts,
    unhandledPromptBehavior?: 'dismiss' | 'accept' | 'dismiss and notify' | 'accept and notify' | 'ignore',
};

type Proxy = {
    proxyType?: 'pac' | 'direct' | 'autodetect' | 'system' | 'manual',
    proxyAutoconfigUrl?: string,
    ftpProxy?: string,
    httpProxy?: string,
    noProxy?: string[],
    sslProxy?: string,
    socksProxy?: string,
    socksVersion?: ubyte,
}

type Timeouts = {
    script: number,
    pageLoad: number,
    implicit: number,
}
