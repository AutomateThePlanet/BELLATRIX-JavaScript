import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Frame extends WebComponent {
    async getName(): Promise<string> {
        return await this.wrappedElement.getAttribute('name');
    }

    async getHref(): Promise<string> {
        return await this.wrappedElement.getAttribute('href');
    }
}
