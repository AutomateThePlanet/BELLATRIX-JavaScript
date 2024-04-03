import { AppiumCommandExecutor } from '@bellatrix/appium/core';
import { MobileCommands } from '@bellatrix/appium/common/commands';
import { HttpCommandExecutor } from '@bellatrix/appium/core/contracts';
import { HttpClient } from '@bellatrix/core/http';

export class AppiumDriver {
    protected capabilities: object;
    protected commandExecutor: HttpCommandExecutor;

    constructor(serverUrl: string, capabilities: object) {
        const httpClient = new HttpClient(new URL(serverUrl));
        this.commandExecutor = new AppiumCommandExecutor(MobileCommands.commandRepository, httpClient);
        this.capabilities = capabilities;
    }

    protected static validatePlatformName(capabilities: object, platformName: string) {
        // @ts-ignore
        const originalPlatformName = capabilities?.platformName;

        if (!originalPlatformName || typeof originalPlatformName !== 'string' || !(originalPlatformName.toLowerCase() === platformName.toLowerCase())) {
            throw Error(`platformName should be set to ${platformName}, but was ${originalPlatformName}.`)
        }

        return capabilities;
    }
}