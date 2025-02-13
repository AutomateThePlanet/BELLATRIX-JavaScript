
import { ComponentService, CookiesService, NavigationService, BrowserService, ScriptService, DialogService } from '@bellatrix/web/services';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { resolve, registerSingleton, getSingletonInstance } from '@bellatrix/core/utilities';
import { WebComponent } from '@bellatrix/web/components';
import { WebPage, WebPageAsserts, WebPageMap } from '@bellatrix/web/pages';

import type { Ctor, ParameterlessCtor } from '@bellatrix/core/types';

export class App {
    private _driver: BrowserController;

    constructor() { // make them in named container, to be context aware? and dispose method to unregister all with that name?
        this._driver = resolve(BrowserController);
        registerSingleton(NavigationService, new NavigationService(this._driver));
        registerSingleton(CookiesService, new CookiesService(this._driver));
        registerSingleton(BrowserService, new BrowserService(this._driver));
        registerSingleton(ScriptService, new ScriptService(this._driver));
        registerSingleton(DialogService, new DialogService(this._driver));
    }

    get navigation() { return resolve(NavigationService); };

    get cookies() { return resolve(CookiesService); };

    get browser() { return resolve(BrowserService); };

    get script() { return resolve(ScriptService); };

    get dialog() { return resolve(DialogService); };

    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(this._driver, type);
    }

    createPage<T extends WebPage<WebPageMap, WebPageAsserts<WebPageMap>>>(page: ParameterlessCtor<T>) {
        return getSingletonInstance(page);
    };

    async goTo<T extends WebPage<WebPageMap, WebPageAsserts<WebPageMap>>>(page: ParameterlessCtor<T>) {
        const instance = getSingletonInstance(page);
        await instance.open();
        return instance;
    };

    async sleep(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}
