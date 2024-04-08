import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Anchor extends WebComponent<HTMLAnchorElement> {
    async click(): Promise<void> {
        await this.wrappedElement.click();
    }

    async getHref(): Promise<string> {
        return await this.wrappedElement.getAttribute('href');
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }

    async getTarget(): Promise<string> {
        return await this.wrappedElement.getAttribute('target');
    }

    async getRel(): Promise<string> {
        return await this.wrappedElement.getAttribute('rel');
    }
}