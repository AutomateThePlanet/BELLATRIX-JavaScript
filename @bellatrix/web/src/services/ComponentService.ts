import { CssFindStrategy, XpathFindStrategy, NameFindStrategy, IdFindStrategy, ClassFindStrategy, FindStrategy, AttributeContainingFindStrategy, AttributeFindStrategy, ClassContainingFindStrategy, IdContainingFindStrategy, IdEndingWithFindStrategy, InnerTextContainingFindStrategy, LinkTextContainingFindStrategy, LinkTextFindStrategy, ValueContainingFindStrategy, TagFindStrategy, NameEndingWithFindStrategy } from "@bellatrix/web/findstrategies";
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

    createAllBy<T extends WebComponent>(type: Ctor<T>, findStrategy: FindStrategy): ComponentsList<T> {
        return new ComponentsList<T>(type, findStrategy, this.driver)
    }

    createByAttributeContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, attribute: string, value: string): T {
        return new type(new AttributeContainingFindStrategy(attribute, value), this.driver);
    }

    createAllByAttributeContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new AttributeContainingFindStrategy(attribute, value), this.driver);
    }

    createByAttribute<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, attribute: string, value: string): T {
        return new type(new AttributeFindStrategy(attribute, value), this.driver);
    }

    createAllByAttribute<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new AttributeFindStrategy(attribute, value), this.driver);
    }

    createByClassContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new ClassContainingFindStrategy(name), this.driver);
    }

    createAllByClassContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new ClassContainingFindStrategy(name), this.driver);
    }

    createByClass<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new ClassFindStrategy(name), this.driver);
    }

    createAllByClass<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new ClassFindStrategy(name), this.driver);
    }

    createByCss<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new CssFindStrategy(name), this.driver);
    }

    createAllByCss<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new CssFindStrategy(name), this.driver);
    }

    createByIdContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new IdContainingFindStrategy(name), this.driver);
    }

    createAllByIdContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new IdContainingFindStrategy(name), this.driver);
    }

    createByIdEndingWith<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new IdEndingWithFindStrategy(name), this.driver);
    }

    createAllByIdEndingWith<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new IdEndingWithFindStrategy(name), this.driver);
    }

    createById<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new IdFindStrategy(name), this.driver);
    }

    createAllById<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new IdFindStrategy(name), this.driver);
    }

    createByInnerTextContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new InnerTextContainingFindStrategy(name), this.driver);
    }

    createAllByInnerTextContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new InnerTextContainingFindStrategy(name), this.driver);
    }

    createByLinkTextContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new LinkTextContainingFindStrategy(name), this.driver);
    }

    createAllByLinkTextContaining<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new LinkTextContainingFindStrategy(name), this.driver);
    }

    createByLinkText<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new LinkTextFindStrategy(name), this.driver);
    }

    createAllByLinkText<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new LinkTextFindStrategy(name), this.driver);
    }

    createByName<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new NameFindStrategy(name), this.driver);
    }

    createAllByName<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new NameFindStrategy(name), this.driver);
    }
    
    createByNameEndingWith<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new NameEndingWithFindStrategy(name), this.driver);
    }

    createAllByNameEndingWith<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new NameEndingWithFindStrategy(name), this.driver);
    }

    createByTag<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new TagFindStrategy(name), this.driver);
    }

    createAllByTag<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new TagFindStrategy(name), this.driver);
    }

    createByValue<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): T {
        return new type(new ValueContainingFindStrategy(name), this.driver);
    }

    createAllByValue<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, name: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new ValueContainingFindStrategy(name), this.driver);
    }

    createByXpath<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, xpath: string): T {
        return new type(new XpathFindStrategy(xpath), this.driver);
    }

    createAllByXpath<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>, xpath: string): ComponentsList<T> {
        return new ComponentsList<T>(type, new XpathFindStrategy(xpath), this.driver)
    }
}