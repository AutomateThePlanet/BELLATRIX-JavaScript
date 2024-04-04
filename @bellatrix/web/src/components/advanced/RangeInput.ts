import { WebComponent } from "components";
import { BellatrixComponent } from "components/decorators";

@BellatrixComponent
export class RangeInput extends WebComponent {
    async getRange(): Promise<number> {
        return parseFloat(await this.getValue());
    }

    async setColor(range: number): Promise<void> {
        await this.defaultSetValue(range);
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

    async getMin(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('min'));
    }

    async getMax(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('max'));
    }

    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }

    async getStep(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('step'));
    }
    
    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    } 
}
