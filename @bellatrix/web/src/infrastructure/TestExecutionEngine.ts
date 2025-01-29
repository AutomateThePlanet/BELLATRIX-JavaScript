import { ServiceLocator } from '@bellatrix/core/utilities';
import { BrowserControllerLifecycleManager } from '@bellatrix/web/infrastructure';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { App } from '.';

import { BellatrixSettings } from '@bellatrix/core/settings';

export class TestExecutionEngine {
    static async startBrowser(): Promise<void> {
        const browserController = await BrowserControllerLifecycleManager.launch();

        ServiceLocator.registerSingleton(BrowserController, browserController); // make it universal, make WebDriver extend Driver
        ServiceLocator.registerSingleton(App, new App); // move
    }

    static async dispose(): Promise<void> {
        const browserController = ServiceLocator.resolve(BrowserController);
        const executionSettings = BellatrixSettings.get().webSettings.executionSettings;
        await browserController.quit();

        ServiceLocator.unregister(BrowserController);
    }
}
