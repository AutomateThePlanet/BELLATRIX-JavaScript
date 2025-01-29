import { WebComponent } from '@bellatrix/web/components';
import { WebService } from './WebService';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { BellatrixWebService } from '@bellatrix/web/services/decorators';

@BellatrixWebService
export class ComponentWaitService extends WebService {
    private _component: WebComponent;

    constructor(driver: BrowserController, component: WebComponent) {
        super(driver);
        this._component = component;
    }

    async toBeVisible(): Promise<void> {
        await this._component.validateIs('visible');
    }

    async toExist(): Promise<void> {
        await this._component.validateIs('present');
    }

    async toBeClickable(): Promise<void> {
        await this._component.validateIs('clickable');
    }

    async toNotBeVisible(): Promise<void> {
        await this._component.validateIsNot('visible');
    }

    async toNotExist(): Promise<void> {
        await this._component.validateIsNot('present');
    }

    async toBeDisabled(): Promise<void> {
        await this._component.validateIsNot('clickable');
    }
}
