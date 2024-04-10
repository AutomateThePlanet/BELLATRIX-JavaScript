import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

const defaultSetMonth = Symbol('defaultSetMonth');

@BellatrixComponent
export class MonthInput extends WebComponent<HTMLInputElement> {
    async getMonth(): Promise<string> {
        return await this.getValue();
    }

    async setMonth(year: number, month: number): Promise<void> {
        await this[defaultSetMonth](year, month);
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

    private async [defaultSetMonth](year: number, month: number): Promise<void> {
        if (year <= 0) {
            throw Error(`The year should be a positive number but you specified: ${year}`);
        }

        if (month <= 0 || month > 12) {
            throw Error(`The month should be between 1 and 12 but you specified: ${month}`);
        }

        let valueToBeSet: string;

        if (month < 10) {
            valueToBeSet = `${year}-0${month}`;
        } else {
            valueToBeSet = `${year}-${month}`;
        }

        await this.evaluate(el => el.value = valueToBeSet);
    }
}
