import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class TimeInput extends WebComponent {
    async getTime(): Promise<string> {
        return await this.getValue();
    }

    async setTime(hours: number, minutes: number): Promise<void> {
        await this.evaluate(el => el.value = `${hours}:${minutes}:00`);
    }

    async getMax(): Promise<string> {
        return await this.wrappedElement.getAttribute('max');
    }

    async getMin(): Promise<string> {
        return await this.wrappedElement.getAttribute('min');
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('autocomplete')).toLowerCase() === 'true';
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

    async getStep(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('step'));
    }
    
    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    } 
}
