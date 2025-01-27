import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';

export abstract class WebService {
    private _driver: BrowserAutomationTool;

    constructor(driver: BrowserAutomationTool) {
        this._driver = driver;
    }

    protected get driver(): BrowserAutomationTool {
        return this._driver;
    }
}
