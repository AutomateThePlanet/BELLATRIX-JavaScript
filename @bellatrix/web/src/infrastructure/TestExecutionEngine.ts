import { registerSingleton, resolve, unregister } from '@bellatrix/core/utilities';
import { BrowserControllerLifecycleManager } from '@bellatrix/web/infrastructure';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { App } from '.';

import { BellatrixSettings } from '@bellatrix/core/settings';

export class TestExecutionEngine {
    static async startBrowser(): Promise<void> {
        const browserController = await BrowserControllerLifecycleManager.launch();

        registerSingleton(BrowserController, browserController); // make it universal, make WebDriver extend Driver
        registerSingleton(App, new App); // move
    }

    static async dispose(): Promise<void> {
        const browserController = resolve(BrowserController);
        const executionSettings = BellatrixSettings.get().webSettings.executionSettings; // TODO: why do we need this?
        await browserController.quit();

        unregister(BrowserController);
    }
}
