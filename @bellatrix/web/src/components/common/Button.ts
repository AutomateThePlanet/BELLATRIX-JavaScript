import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Button extends WebComponent<HTMLButtonElement> {
    async click(): Promise<void> {
        await this.wrappedElement.click();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }
}