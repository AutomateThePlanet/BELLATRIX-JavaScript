import { WebComponent } from "components";
import { BellatrixComponent } from "components/decorators";

@BellatrixComponent
export class PhoneField extends WebComponent {
    async getPhone(): Promise<string> {
        return await this.getValue();
    }

    async setPhone(phone: string): Promise<void> {
        await this.wrappedElement.setText(phone);
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async getMinLength(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('min'));
    }

    async getMaxLength(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('max'));
    }

    async getPlaceholder(): Promise<string> {
        return await this.wrappedElement.getAttribute('placeholder');
    }

    async isReadonly(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('readonly')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }  

    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }
    
    async getSize(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('size'));
    }

    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    } 
}
