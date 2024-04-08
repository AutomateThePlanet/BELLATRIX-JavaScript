import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

const defaultSetWeek = Symbol('defaultSetWeek');

@BellatrixComponent
export class WeekInput extends WebComponent {
    async getWeek(): Promise<string> {
        return await this.getValue();
    }

    async setWeek(year: number, weekNumber: number): Promise<void> {
        await this[defaultSetWeek](year, weekNumber);
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