import { ServiceLocator } from '@bellatrix/core/utilities';
import { BrowserAutomationToolLaunchService } from '@bellatrix/web/services';
import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { App } from '.';

import type { BrowserConfiguration } from '@bellatrix/web/services';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { HttpClient } from '@bellatrix/core/http';

export class TestExecutionEngine {
    static async startBrowser(): Promise<void> {
        const browserAutomationTool = await BrowserAutomationToolLaunchService.launch();

        ServiceLocator.registerSingleton(BrowserAutomationTool, browserAutomationTool); // make it universal, make WebDriver extend Driver
        ServiceLocator.registerSingleton(App, new App); // move
    }

    static async dispose(): Promise<void> {
        const browserAutomationTool = ServiceLocator.resolve(BrowserAutomationTool);
        const executionSettings = BellatrixSettings.get().webSettings.executionSettings;
        await browserAutomationTool.quit();

        ServiceLocator.unregister(BrowserAutomationTool);
    }
}
