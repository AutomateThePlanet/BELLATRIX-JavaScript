import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';
import { Ctor } from '@bellatrix/core/types';

@BellatrixWebComponent
export class Label extends WebComponent<HTMLLabelElement> {
    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getFor(): Promise<string> {
        return await this.getAttribute('for');
    }

    async getRelatedComponent<T extends WebComponent>(type?: Ctor<T, ConstructorParameters<typeof WebComponent>>): Promise<T> {
        return this.create(type ?? WebComponent).byId(await this.getFor()) as T;
    }
}
