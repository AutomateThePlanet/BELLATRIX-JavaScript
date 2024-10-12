import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class Reset extends WebComponent<HTMLButtonElement> {
    async click(): Promise<void> {
        await this.wrappedElement.click();
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }
}