import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class DateInput extends WebComponent {
    async getDate(): Promise<string> {
        return await this.getValue();
    }

    async setDate(year: number, month: number, day: number): Promise<void> {
        await this.defaultSetDate(year, month, day);
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

    private async defaultSetDate(year: number, month: number, day: number): Promise<void> {
        if (year <= 0) {
            throw Error(`The year should be a positive number but you specified: ${year}`);
        }

        if (month <= 0) {
            throw Error(`The month should be a positive number but you specified: ${month}`);
        }

        if (day <= 0) {
            throw Error(`The day should be a positive number but you specified: ${day}`);
        }

        let valueToBeSet: string;

        if (month < 10) {
            valueToBeSet = `${year}-0${month}`;
        } else {
            valueToBeSet = `${year}-${month}`;
        }

        if (day < 10) {
            valueToBeSet = `${valueToBeSet}-0${day}`;
        } else {
            valueToBeSet = `${valueToBeSet}-${day}`;
        }

        await this.defaultSetValue(valueToBeSet);
    }
}
