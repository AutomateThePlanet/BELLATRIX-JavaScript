
import { ComponentService, CookiesService, NavigationService, BrowserService, ScriptService } from '@bellatrix/web/services';
import { BrowserAutomationTool } from '@bellatrix/web/infrastructure/browserautomationtools/core';
import { ServiceLocator, SingletonFactory } from '@bellatrix/core/utilities';
import { WebPage } from '@bellatrix/web/pages';

import type { ParameterlessCtor } from '@bellatrix/core/types';

export class App {
    constructor() { // make them in named container, to be context aware? and dispose method to unregister all with that name?
        const driver = ServiceLocator.resolve(BrowserAutomationTool);
        ServiceLocator.registerSingleton(NavigationService, new NavigationService(driver));
        ServiceLocator.registerSingleton(ComponentService, new ComponentService(driver));
        ServiceLocator.registerSingleton(CookiesService, new CookiesService(driver));
        ServiceLocator.registerSingleton(BrowserService, new BrowserService(driver));
    }

    get navigation() { return ServiceLocator.resolve(NavigationService) };

    get components() { return ServiceLocator.resolve(ComponentService) };
    
    get cookies() { return ServiceLocator.resolve(CookiesService) };
    
    get browser() { return ServiceLocator.resolve(BrowserService) };

    get script() { return ServiceLocator.resolve(ScriptService) };

    create<T extends WebPage<any, any>>(page: ParameterlessCtor<T>) {
        return SingletonFactory.getInstance(page)
    };

    async goTo<T extends WebPage<any, any>>(page: ParameterlessCtor<T>) {
        const instance = SingletonFactory.getInstance(page);
        await instance.open();
        return instance;
    };
}