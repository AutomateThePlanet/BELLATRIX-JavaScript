import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Reset extends WebComponent<HTMLButtonElement> {
    async click(): Promise<void> {
        await this.wrappedElement.click();
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }
}