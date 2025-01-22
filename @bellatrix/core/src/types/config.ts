import { RecursivePartial, TestFramework, TestReporter } from "@bellatrix/core/types";

export interface BellatrixConfiguration {
    frameworkSettings: FrameworkSettings;
}

export interface FrameworkSettings {
    testSettings: TestSettings;
    parallelExecutionSettings: ParallelExecutionSettings;
}

export interface ParallelExecutionSettings {
    // by class, by file or by test
}

export interface TestSettings {
    testTimeout: number;
    testFramework: TestFramework;
    testReporter: TestReporter; // TODO: add option for TestReporter[]
    testReportDirectory?: string;
    testReportName?: string;
    parallelExecution: boolean;
}

export type BellatrixConfigurationOverride = BellatrixConfiguration

// {
//     "frameworkSettings": {
//         "testSettings": {
//             "testTimeout": 60000,
//             "testFramework": "jest", // jasmine, mocha, vitest, playwright
//             "parallelExecution": true
//         }
//     },
//     "webSettings": {
//         "timeoutSettings": {
//             "findElementTimeout": 30000,
//             "pageLoadTimeout": 30000,
//             "waitForAjaxTimeout": 30000,
//             "scriptTimeout": 1000,
//             "sleepInterval": 50
//         },
//         "actionSettings": {
//             "delayBeforeAction": 0
//         },
//         "executionSettings": {
//             "browserAutomationTool": "playwright", // selenium, cypress
//             "browser": "chrome", // firefox, safari, edge
//             "headless": false,
//             "executionType": "local" // remote
//         },
//         "remoteExecutionSettings": {
//             "remoteUrl": "localhost:4444",
//             "user": "", // rename
//             "key": "" // rename
//         }
//     }
// }