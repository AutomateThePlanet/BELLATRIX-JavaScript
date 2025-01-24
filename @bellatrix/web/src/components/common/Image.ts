import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class Image extends WebComponent<HTMLImageElement> {
    async getSrc(): Promise<string> {
        return await this.getAttribute('src');
    }

    async getLongDesc(): Promise<string> {
        return await this.getAttribute('longdesc');
    }

    async getAlt(): Promise<string> {
        return await this.getAttribute('alt');
    }

    async getSrcSet(): Promise<string> {
        return await this.getAttribute('srcset');
    }

    async getSizes(): Promise<string> {
        return await this.getAttribute('sizes');
    }

    async getHeight(): Promise<number> {
        return parseFloat(await this.getAttribute('height'));
    }

    async getWidth(): Promise<number> {
        return parseFloat(await this.getAttribute('width'));
    }
}
