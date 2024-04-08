import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Heading extends WebComponent<HTMLHeadingElement> {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
}