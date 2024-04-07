import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Image extends WebComponent {
    async getSrc(): Promise<string> {
        return await this.wrappedElement.getAttribute('src');
    }

    async getLongDesc(): Promise<string> {
        return await this.wrappedElement.getAttribute('longdesc');
    }

    async getAlt(): Promise<string> {
        return await this.wrappedElement.getAttribute('alt');
    }

    async getSrcSet(): Promise<string> {
        return await this.wrappedElement.getAttribute('srcset');
    }

    async getSizes(): Promise<string> {
        return await this.wrappedElement.getAttribute('sizes');
    }

    async getHeight(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('height'));
    }

    async getWidth(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('width'));
    }
}