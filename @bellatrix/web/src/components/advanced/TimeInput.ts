import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class TimeInput extends WebComponent<HTMLInputElement> {
    async getTime(): Promise<string> {
        return await this.getValue();
    }

    async setTime(hours: number, minutes: number): Promise<void> {
        await this.evaluate(el => el.value = `${hours}:${minutes}:00`);
    }

    async getMax(): Promise<string> {
        return await this.getAttribute('max');
    }

    async getMin(): Promise<string> {
        return await this.getAttribute('min');
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
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

    async getStep(): Promise<number> {
        return parseFloat(await this.getAttribute('step'));
    }
    
    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    } 
}
