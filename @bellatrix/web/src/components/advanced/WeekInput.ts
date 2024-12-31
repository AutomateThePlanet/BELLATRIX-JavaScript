import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

const defaultSetWeek = Symbol('defaultSetWeek');

@BellatrixWebComponent
export class WeekInput extends WebComponent<HTMLInputElement> {
    async getWeek(): Promise<string> {
        return await this.getValue();
    }

    async setWeek(year: number, weekNumber: number): Promise<void> {
        await this[defaultSetWeek](year, weekNumber);
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

    private async [defaultSetWeek](year: number, weekNumber: number): Promise<void> {
        if (weekNumber < 1 || weekNumber > 52) {
            throw new Error(`The week number should be between 1 and 52 but you specified: ${weekNumber}`);
        }
        if (year <= 0) {
            throw new Error(`The year should be a positive number but you specified: ${year}`);
        }

        const valueToBeSet = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

        this.evaluate(el => el.value = valueToBeSet);
    }
}