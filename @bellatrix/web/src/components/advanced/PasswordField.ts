import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class PasswordField extends WebComponent<HTMLInputElement> {
    async getPassword(): Promise<string> {
        return await this.getValue();
    }

    async setPassword(password: string): Promise<void> {
        await this.wrappedElement.setText(password);
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async getMinLength(): Promise<number> {
        return parseInt(await this.getAttribute('min'));
    }

    async getMaxLength(): Promise<number> {
        return parseInt(await this.getAttribute('max'));
    }

    async getPlaceholder(): Promise<string> {
        return await this.getAttribute('placeholder');
    }

    async isReadonly(): Promise<boolean> {
        return (await this.getAttribute('readonly')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async isRequired(): Promise<boolean> {
        return (await this.getAttribute('required')).toLowerCase() === 'true';
    }

    async getSize(): Promise<number> {
        return parseInt(await this.getAttribute('size'));
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }
}
