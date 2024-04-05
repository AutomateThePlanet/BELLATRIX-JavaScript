
import { ComponentService, CookiesService, NavigationService, BrowserService, ScriptService, DialogService } from '@bellatrix/web/services';
import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ServiceLocator, SingletonFactory } from '@bellatrix/core/utilities';
import { WebPage } from '@bellatrix/web/pages';

import type { Ctor, ParameterlessCtor } from '@bellatrix/core/types';
import { WebComponent } from 'components';

export class App {
    private _driver: BrowserAutomationTool;

    constructor() { // make them in named container, to be context aware? and dispose method to unregister all with that name?
        this._driver = ServiceLocator.resolve(BrowserAutomationTool);
        ServiceLocator.registerSingleton(NavigationService, new NavigationService(this._driver));
        ServiceLocator.registerSingleton(CookiesService, new CookiesService(this._driver));
        ServiceLocator.registerSingleton(BrowserService, new BrowserService(this._driver));
    }

    get navigation() { return ServiceLocator.resolve(NavigationService) };
    
    get cookies() { return ServiceLocator.resolve(CookiesService) };
    
    get browser() { return ServiceLocator.resolve(BrowserService) };

    get script() { return ServiceLocator.resolve(ScriptService) };

    get dialog() { return ServiceLocator.resolve(DialogService) };

    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(this._driver, type);
    }

    createPage<T extends WebPage<any, any>>(page: ParameterlessCtor<T>) {
        return SingletonFactory.getInstance(page)
    };

    async goTo<T extends WebPage<any, any>>(page: ParameterlessCtor<T>) {
        const instance = SingletonFactory.getInstance(page);
        await instance.open();
        return instance;
    };
}