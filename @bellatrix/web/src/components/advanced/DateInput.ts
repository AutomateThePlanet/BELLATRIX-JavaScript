import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class DateInput extends WebComponent<HTMLInputElement> {
    async getDate(): Promise<Date | null> {
        return await this.evaluate(el => el.valueAsDate);
    }

    async setDate(date: Date): Promise<void> {
        await this.evaluate(el => el.value = date.toDateString());
    }

    async getMax(): Promise<Date | null> {
        const dateString = await this.getAttribute('max');
        return dateString === '' ? null : new Date(dateString);
    }

    async getMin(): Promise<Date | null> {
        const dateString = await this.getAttribute('min');
        return dateString === '' ? null : new Date(dateString);
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
