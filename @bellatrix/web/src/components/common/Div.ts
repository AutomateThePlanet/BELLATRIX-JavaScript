import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Div extends WebComponent<HTMLDivElement> {
    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
}