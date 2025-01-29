import { BellatrixWebService } from '@bellatrix/web/services/decorators';
import * as path from 'path';

import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { WebService } from '.';

@BellatrixWebService
export class NavigationService extends WebService {
    constructor(driver: BrowserController) {
        super(driver);
    }

    async navigate(url: string | URL): Promise<void> {
        if (typeof url === 'string') {
            await this.driver.open(url);
            return;
        }

        await this.driver.open(url.href);
    }

    async navigateToLocalPage(pathToFile: string): Promise<void> {
        const url = new URL(`file://${path.resolve(pathToFile)}`);
        await this.driver.open(url.href);
    }

    // async waitForPartialUrl(partialUrl: string): Promise<void> { ... }

    // async getQueryParameter(name: string): Promise<void> { ... }
}
