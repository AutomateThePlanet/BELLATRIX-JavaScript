import { CssFindStrategy, XpathFindStrategy, NameFindStrategy, IdFindStrategy, ClassFindStrategy, FindStrategy, AttributeContainingFindStrategy, AttributeFindStrategy, ClassContainingFindStrategy, IdContainingFindStrategy, IdEndingWithFindStrategy, InnerTextContainingFindStrategy, LinkTextContainingFindStrategy, LinkTextFindStrategy, ValueContainingFindStrategy, TagFindStrategy, NameEndingWithFindStrategy } from "@bellatrix/web/findstrategies";
import { ComponentsList, WebComponent } from "@bellatrix/web/components";
import { BrowserAutomationTool, WebElement } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { WebService } from ".";

import type { Ctor } from "@bellatrix/core/types";

export class ComponentService<T extends WebComponent> extends WebService {
    constructor(driver: BrowserAutomationTool, private _type: Ctor<T>, private _parentElement?: WebElement) {
        super(driver);
    }

    by(findStrategy: FindStrategy): T {
        return new this._type(findStrategy, this.driver, this._parentElement);
    }

    allBy(findStrategy: FindStrategy): ComponentsList<T> {
        return new ComponentsList<T>(this._type, findStrategy, this.driver, this._parentElement);
    }

    byAttributeContaining(attribute: string, value: string): T {
        return new this._type(new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentElement);
    }

    allByAttributeContaining(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentElement);
    }

    byAttribute(attribute: string, value: string): T {
        return new this._type(new AttributeFindStrategy(attribute, value), this.driver, this._parentElement);
    }

    allByAttribute(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeFindStrategy(attribute, value), this.driver, this._parentElement);
    }

    byClassContaining(name: string): T {
        return new this._type(new ClassContainingFindStrategy(name), this.driver, this._parentElement);
    }

    allByClassContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassContainingFindStrategy(name), this.driver, this._parentElement);
    }

    byClass(name: string): T {
        return new this._type(new ClassFindStrategy(name), this.driver, this._parentElement);
    }

    allByClass(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassFindStrategy(name), this.driver, this._parentElement);
    }

    byCss(name: string): T {
        return new this._type(new CssFindStrategy(name), this.driver, this._parentElement);
    }

    allByCss(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new CssFindStrategy(name), this.driver, this._parentElement);
    }

    byIdContaining(name: string): T {
        return new this._type(new IdContainingFindStrategy(name), this.driver, this._parentElement);
    }

    allByIdContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdContainingFindStrategy(name), this.driver, this._parentElement);
    }

    byIdEndingWith(name: string): T {
        return new this._type(new IdEndingWithFindStrategy(name), this.driver, this._parentElement);
    }

    allByIdEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdEndingWithFindStrategy(name), this.driver, this._parentElement);
    }

    byId(name: string): T {
        return new this._type(new IdFindStrategy(name), this.driver, this._parentElement);
    }

    allById(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdFindStrategy(name), this.driver, this._parentElement);
    }

    byInnerTextContaining(name: string): T {
        return new this._type(new InnerTextContainingFindStrategy(name), this.driver, this._parentElement);
    }

    allByInnerTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new InnerTextContainingFindStrategy(name), this.driver, this._parentElement);
    }

    byLinkTextContaining(name: string): T {
        return new this._type(new LinkTextContainingFindStrategy(name), this.driver, this._parentElement);
    }

    allByLinkTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextContainingFindStrategy(name), this.driver, this._parentElement);
    }

    byLinkText(name: string): T {
        return new this._type(new LinkTextFindStrategy(name), this.driver, this._parentElement);
    }

    allByLinkText(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextFindStrategy(name), this.driver, this._parentElement);
    }

    byName(name: string): T {
        return new this._type(new NameFindStrategy(name), this.driver, this._parentElement);
    }

    allByName(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameFindStrategy(name), this.driver, this._parentElement);
    }
    
    byNameEndingWith(name: string): T {
        return new this._type(new NameEndingWithFindStrategy(name), this.driver, this._parentElement);
    }

    allByNameEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameEndingWithFindStrategy(name), this.driver, this._parentElement);
    }

    byTag(name: string): T {
        return new this._type(new TagFindStrategy(name), this.driver, this._parentElement);
    }

    allByTag(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new TagFindStrategy(name), this.driver, this._parentElement);
    }

    byValueContaining(name: string): T {
        return new this._type(new ValueContainingFindStrategy(name), this.driver, this._parentElement);
    }

    allByValueContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ValueContainingFindStrategy(name), this.driver, this._parentElement);
    }

    byXpath(xpath: string): T {
        return new this._type(new XpathFindStrategy(xpath), this.driver, this._parentElement);
    }

    allByXpath(xpath: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new XpathFindStrategy(xpath), this.driver, this._parentElement)
    }
}