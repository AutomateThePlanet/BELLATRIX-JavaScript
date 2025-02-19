import { BellatrixConfiguration } from '@bellatrix/core/types';

export class BellatrixSettings {
    private static _config: BellatrixConfiguration = JSON.parse(process.env.BELLATRIX_CONFIGURAITON!);

    public static get<T extends BellatrixConfiguration>(): T {
        return { ...this._config} as T;
    }
}
