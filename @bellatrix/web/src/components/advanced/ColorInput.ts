import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class ColorInput extends WebComponent {
    async getColor(): Promise<string> {
        return await this.getValue();
    }

    async setColor(color: string): Promise<void> {
        await this.evaluate(el => el.value = color);
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }  

    async getList(): Promise<string> {
        return await this.wrappedElement.getAttribute('list');
    }

    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }
    
    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    } 
}
