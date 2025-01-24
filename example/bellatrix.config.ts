import { BellatrixConfigurationOverride } from '@bellatrix/core/types';

const config: BellatrixConfigurationOverride = {
    frameworkSettings: {
        testSettings: {
            testTimeout: 300000,
            testFramework: 'vitest', // vitest, jasmine, mocha, jest, playwright
            testReporter: 'console-only',
            testReportDirectory: './reports',
            testReportName: `result`,
            parallelExecution: false, // not functional yet
        },
        parallelExecutionSettings: {

        }
    },
    webSettings: {
        timeoutSettings: {
            findElementTimeout: 30000,
            validationTimeout: 30000,
            pageLoadTimeout: 30000,
            waitForAjaxTimeout: 30000,
            scriptTimeout: 10000,
            sleepInterval: 1000,
        },
        actionSettings: {
            delayBeforeAction: 0,
        },
        executionSettings: {
            browserAutomationTool: 'playwright', // playwright, selenium
            browser: 'edge', // chrome, firefox, safari, edge
            // viewport: { width: 1920, height: 1080 },
            startMaximized: true,
            headless: false,
            executionType: 'local', // remote
            baseUrl: 'https://demos.bellatrix.solutions/'
        },
        remoteExecutionSettings: {
            provider: 'LambdaTest',
            username: '',
            accessKey: '',
            capabilities: {
                browserName: 'chrome'
            }
        }
    }
};

export default config;
