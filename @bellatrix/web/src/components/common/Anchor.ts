import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Anchor extends WebComponent {
    async click(): Promise<void> {
        await this.wrappedElement.click();
    }

    async getHref(): Promise<string> {
        return await this.wrappedElement.getAttribute('href');
    }


    async getTest123(name: string, age: number): Promise<number> {
        return 123;
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }
}