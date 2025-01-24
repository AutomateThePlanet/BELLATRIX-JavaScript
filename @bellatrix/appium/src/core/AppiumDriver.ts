import { AppiumCommandExecutor } from '@bellatrix/appium/core';
import { MobileCommands } from '@bellatrix/appium/common/commands';
import { HttpCommandExecutor } from '@bellatrix/appium/core/contracts';
import { HttpClient } from '@bellatrix/core/http';

export class AppiumDriver {
    protected capabilities: Record<string, unknown>;
    protected commandExecutor: HttpCommandExecutor;

    constructor(serverUrl: string, capabilities: Record<string, unknown>) {
        const httpClient = new HttpClient(new URL(serverUrl));
        this.commandExecutor = new AppiumCommandExecutor(MobileCommands.commandRepository, httpClient);
        this.capabilities = capabilities;
    }

    protected static validatePlatformName(capabilities: Record<string, unknown>, platformName: string) {
        const originalPlatformName = capabilities?.platformName;

        if (!originalPlatformName || typeof originalPlatformName !== 'string' || !(originalPlatformName.toLowerCase() === platformName.toLowerCase())) {
            throw Error(`platformName should be set to ${platformName}, but was ${originalPlatformName}.`);
        }

        return capabilities;
    }
}
