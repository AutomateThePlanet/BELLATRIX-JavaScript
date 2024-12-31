import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class RadioButton extends WebComponent<HTMLInputElement> {
    async click(): Promise<void> {
        return await this.wrappedElement.click();
    }

    async isChecked(): Promise<boolean> {
        return await this.wrappedElement.isChecked();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }
}