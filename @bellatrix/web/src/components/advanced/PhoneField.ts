import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class PhoneField extends WebComponent<HTMLInputElement> {
    async getPhone(): Promise<string> {
        return await this.getValue();
    }

    async setPhone(phone: string): Promise<void> {
        await this.wrappedElement.setText(phone);
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

    async getPattern(): Promise<string> {
        return await this.getAttribute('pattern');
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
