import { WebComponent } from "@bellatrix/web/components";

export class ComponentWaitService {
    private _component: WebComponent;

    constructor(component: WebComponent) {
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