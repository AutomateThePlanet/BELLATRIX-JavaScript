import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class ColorInput extends WebComponent<HTMLInputElement> {
    async getColor(): Promise<string> {
        return await this.getValue();
    }

    async setColor(color: string): Promise<void> {
        await this.evaluate(el => el.value = color);
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }  

    async getList(): Promise<string> {
        return await this.getAttribute('list');
    }

    async isRequired(): Promise<boolean> {
        return (await this.getAttribute('required')).toLowerCase() === 'true';
    }
    
    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    } 
}
