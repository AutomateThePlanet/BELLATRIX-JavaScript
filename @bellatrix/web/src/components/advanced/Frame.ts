import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class Frame extends WebComponent<HTMLIFrameElement> {
    async getName(): Promise<string> {
        return await this.getAttribute('name');
    }

    async getHref(): Promise<string> {
        return await this.getAttribute('href');
    }
}
