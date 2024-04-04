import { WebComponent } from "components";
import { BellatrixComponent } from "components/decorators";

@BellatrixComponent
export class DateTimeInput extends WebComponent {
    async getTime(): Promise<string> {
        return await this.getValue();
    }

    async setTime(dateTime: Date): Promise<void> {
        // TODO: Test dateTime.toString()
        ////defaultSetValue(SETTING_TIME, TIME_SET, String.format("%d-%d-%dT%d:%d", time.getYear(), time.getMonthValue(), time.getDayOfMonth(), time.getHour(), time.getMinute()));
        await this.defaultSetValue(dateTime.toString());
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
