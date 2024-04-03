import { ServiceLocator } from '@bellatrix/core/utilities';
import { BrowserAutomationToolLaunchService } from '@bellatrix/web/services';
import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { App } from '.';

import type { BrowserConfiguration } from '@bellatrix/web/services';

export class TestExecutionEngine {
    static async startBrowser(browserConfiguration: BrowserConfiguration): Promise<void> {
        const driver = await BrowserAutomationToolLaunchService.launch(browserConfiguration);

        ServiceLocator.registerSingleton(BrowserAutomationTool, driver); // make it universal, make WebDriver extend Driver
        ServiceLocator.registerSingleton(App, new App); // move
    }

    static async dispose(): Promise<void> {
        const driver = ServiceLocator.resolve(BrowserAutomationTool);
        await driver.quit();

        ServiceLocator.unregister(BrowserAutomationTool);
    }
}