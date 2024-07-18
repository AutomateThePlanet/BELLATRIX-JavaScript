import { CssFindStrategy, XpathFindStrategy, NameFindStrategy, IdFindStrategy, ClassFindStrategy, FindStrategy, AttributeContainingFindStrategy, AttributeFindStrategy, ClassContainingFindStrategy, IdContainingFindStrategy, IdEndingWithFindStrategy, InnerTextContainingFindStrategy, LinkTextContainingFindStrategy, LinkTextFindStrategy, ValueContainingFindStrategy, TagFindStrategy, NameEndingWithFindStrategy } from "@bellatrix/web/findstrategies";
import { ComponentsList, ShadowRootContext, WebComponent } from "@bellatrix/web/components";
import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";

import type { Ctor } from "@bellatrix/core/types";

export class ComponentService<T extends WebComponent> extends WebService {
    private _type: Ctor<T>;
    private _parentComponent?: WebComponent | ShadowRootContext;

    constructor(driver: BrowserAutomationTool, type: Ctor<T>, parentComponent?: WebComponent | ShadowRootContext) {
        super(driver);
        this._type = type;
        this._parentComponent = parentComponent;
    }

    by(findStrategy: FindStrategy): T {
        return new this._type(findStrategy, this.driver, this._parentComponent);
    }

    allBy(findStrategy: FindStrategy): ComponentsList<T> {
        return new ComponentsList<T>(this._type, findStrategy, this.driver, this._parentComponent);
    }

    byAttributeContaining(attribute: string, value: string): T {
        return new this._type(new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentComponent);
    }

    allByAttributeContaining(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentComponent);
    }

    byAttribute(attribute: string, value: string): T {
        return new this._type(new AttributeFindStrategy(attribute, value), this.driver, this._parentComponent);
    }

    allByAttribute(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeFindStrategy(attribute, value), this.driver, this._parentComponent);
    }

    byClassContaining(name: string): T {
        return new this._type(new ClassContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    allByClassContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    byClass(name: string): T {
        return new this._type(new ClassFindStrategy(name), this.driver, this._parentComponent);
    }

    allByClass(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassFindStrategy(name), this.driver, this._parentComponent);
    }

    byCss(name: string): T {
        return new this._type(new CssFindStrategy(name), this.driver, this._parentComponent);
    }

    allByCss(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new CssFindStrategy(name), this.driver, this._parentComponent);
    }

    byIdContaining(name: string): T {
        return new this._type(new IdContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    allByIdContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    byIdEndingWith(name: string): T {
        return new this._type(new IdEndingWithFindStrategy(name), this.driver, this._parentComponent);
    }

    allByIdEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdEndingWithFindStrategy(name), this.driver, this._parentComponent);
    }

    byId(name: string): T {
        return new this._type(new IdFindStrategy(name), this.driver, this._parentComponent);
    }

    allById(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdFindStrategy(name), this.driver, this._parentComponent);
    }

    byInnerTextContaining(name: string): T {
        return new this._type(new InnerTextContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    allByInnerTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new InnerTextContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    byLinkTextContaining(name: string): T {
        return new this._type(new LinkTextContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    allByLinkTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    byLinkText(name: string): T {
        return new this._type(new LinkTextFindStrategy(name), this.driver, this._parentComponent);
    }

    allByLinkText(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextFindStrategy(name), this.driver, this._parentComponent);
    }

    byName(name: string): T {
        return new this._type(new NameFindStrategy(name), this.driver, this._parentComponent);
    }

    allByName(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameFindStrategy(name), this.driver, this._parentComponent);
    }
    
    byNameEndingWith(name: string): T {
        return new this._type(new NameEndingWithFindStrategy(name), this.driver, this._parentComponent);
    }

    allByNameEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameEndingWithFindStrategy(name), this.driver, this._parentComponent);
    }

    byTag(name: string): T {
        return new this._type(new TagFindStrategy(name), this.driver, this._parentComponent);
    }

    allByTag(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new TagFindStrategy(name), this.driver, this._parentComponent);
    }

    byValueContaining(name: string): T {
        return new this._type(new ValueContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    allByValueContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ValueContainingFindStrategy(name), this.driver, this._parentComponent);
    }

    byXpath(xpath: string): T {
        return new this._type(new XpathFindStrategy(xpath), this.driver, this._parentComponent);
    }

    allByXpath(xpath: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new XpathFindStrategy(xpath), this.driver, this._parentComponent)
    }
}