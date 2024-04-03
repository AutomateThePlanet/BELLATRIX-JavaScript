import { BellatrixConfigurationOverride } from "@bellatrix/core/types";

const config: BellatrixConfigurationOverride = {
    frameworkSettings: {
        testSettings: {
            testTimeout: 300000,
            testFramework: 'playwright', // vitest, jasmine, mocha, jest, playwright
            parallelExecution: true // not functional yet
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
            browser: 'chrome', // chrome, firefox, safari, edge
            viewport: { width: 1920, height: 1080 },
            // startMaximized: true,
            headless: false,
            executionType: 'local', // remote
            baseUrl: 'https://demos.bellatrix.solutions/'
        },
        remoteExecutionSettings: {
            remoteUrl: 'localhost:4444',
            user: '', // rename
            key: '' // rename
        }
    }
};

export default config;