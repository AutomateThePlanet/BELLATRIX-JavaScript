import { CssFindStrategy, XpathFindStrategy, NameFindStrategy, IdFindStrategy, ClassFindStrategy, FindStrategy, AttributeContainingFindStrategy, AttributeFindStrategy, ClassContainingFindStrategy, IdContainingFindStrategy, IdEndingWithFindStrategy, InnerTextContainingFindStrategy, LinkTextContainingFindStrategy, LinkTextFindStrategy, ValueContainingFindStrategy, TagFindStrategy, NameEndingWithFindStrategy } from '@bellatrix/web/findstrategies';
import { ComponentsList, ShadowRootContext, WebComponent } from '@bellatrix/web/components';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { BellatrixWebService } from '@bellatrix/web/services/decorators';
import { get as stackTrace } from 'stack-trace';
import { WebService } from '.';

import type { Ctor } from '@bellatrix/core/types';

@BellatrixWebService
export class ComponentService<T extends WebComponent> extends WebService {
    private _type: Ctor<T>;
    private _parentComponent?: WebComponent | ShadowRootContext;
    private _componentName?: string;

    constructor(driver: BrowserController, type: Ctor<T>, parentComponent?: WebComponent | ShadowRootContext) {
        super(driver);
        this._type = type;
        this._parentComponent = parentComponent;

        const stackFrame = stackTrace()[2];
        if (stackFrame?.getFunctionName().startsWith('get ')) {
            this._componentName = stackFrame.getMethodName();
        }
    }

    by(findStrategy: FindStrategy): T {
        return new this._type(findStrategy, this.driver, this._parentComponent, undefined, this._componentName);
    }

    allBy(findStrategy: FindStrategy): ComponentsList<T> {
        return new ComponentsList<T>(this._type, findStrategy, this.driver, this._parentComponent, this._componentName);
    }

    byAttributeContaining(attribute: string, value: string): T {
        return new this._type(new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByAttributeContaining(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeContainingFindStrategy(attribute, value), this.driver, this._parentComponent, this._componentName);
    }

    byAttribute(attribute: string, value: string): T {
        return new this._type(new AttributeFindStrategy(attribute, value), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByAttribute(attribute: string, value: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new AttributeFindStrategy(attribute, value), this.driver, this._parentComponent, this._componentName);
    }

    byClassContaining(name: string): T {
        return new this._type(new ClassContainingFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByClassContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassContainingFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byClass(name: string): T {
        return new this._type(new ClassFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByClass(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ClassFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byCss(name: string): T {
        return new this._type(new CssFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByCss(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new CssFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byIdContaining(name: string): T {
        return new this._type(new IdContainingFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByIdContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdContainingFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byIdEndingWith(name: string): T {
        return new this._type(new IdEndingWithFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByIdEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdEndingWithFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byId(name: string): T {
        return new this._type(new IdFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allById(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new IdFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byInnerTextContaining(name: string): T {
        return new this._type(new InnerTextContainingFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByInnerTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new InnerTextContainingFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byLinkTextContaining(name: string): T {
        return new this._type(new LinkTextContainingFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByLinkTextContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextContainingFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byLinkText(name: string): T {
        return new this._type(new LinkTextFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByLinkText(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new LinkTextFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byName(name: string): T {
        return new this._type(new NameFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByName(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byNameEndingWith(name: string): T {
        return new this._type(new NameEndingWithFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByNameEndingWith(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new NameEndingWithFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byTag(name: string): T {
        return new this._type(new TagFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByTag(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new TagFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byValueContaining(name: string): T {
        return new this._type(new ValueContainingFindStrategy(name), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByValueContaining(name: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new ValueContainingFindStrategy(name), this.driver, this._parentComponent, this._componentName);
    }

    byXpath(xpath: string): T {
        return new this._type(new XpathFindStrategy(xpath), this.driver, this._parentComponent, undefined, this._componentName);
    }

    allByXpath(xpath: string): ComponentsList<T> {
        return new ComponentsList<T>(this._type, new XpathFindStrategy(xpath), this.driver, this._parentComponent);
    }
}
