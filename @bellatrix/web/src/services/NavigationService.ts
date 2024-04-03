import * as path from 'path';

import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";

export class NavigationService extends WebService {
    constructor(driver: BrowserAutomationTool) {
        super(driver);
    }

    async navigate(url: string): Promise<void>
    async navigate(url: URL): Promise<void>
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