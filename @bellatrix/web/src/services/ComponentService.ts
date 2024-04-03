import { CssFindStrategy, XpathFindStrategy, NameFindStrategy, IdFindStrategy, ClassFindStrategy, FindStrategy } from "@bellatrix/web/findstrategies";
import { ComponentsList, WebComponent } from "@bellatrix/web/components";
import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";

import type { Ctor } from "@bellatrix/core/types";

export class ComponentService extends WebService {
    constructor(driver: BrowserAutomationTool) {
        super(driver);
    }

    createBy<T extends WebComponent>(type: Ctor<T>, findStrategy: FindStrategy): T {
        return new type(findStrategy, this.driver);
    }

    createByXpath<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, xpath: string): T {
        return new type(new XpathFindStrategy(xpath), this.driver);
    }

    createAllByXpath<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, xpath: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new XpathFindStrategy(xpath), this.driver)
    }

    createByName<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new NameFindStrategy(name), this.driver);
    }

    createByCss<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new CssFindStrategy(name), this.driver);
    }

    createByClass<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new ClassFindStrategy(name), this.driver);
    }

    createById<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new IdFindStrategy(name), this.driver);
    }

    createByInnerTextContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new IdFindStrategy(name), this.driver);
    }
}