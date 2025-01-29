import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';

export abstract class WebService {
    private _driver: BrowserController;

    constructor(driver: BrowserController) {
        this._driver = driver;
    }

    protected get driver(): BrowserController {
        return this._driver;
    }
}
