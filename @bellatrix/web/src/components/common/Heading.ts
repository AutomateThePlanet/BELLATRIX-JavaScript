import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Heading extends WebComponent {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
}