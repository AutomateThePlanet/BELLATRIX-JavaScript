import { WebComponent } from "@bellatrix/web/components";
import { BellatrixComponent } from "@bellatrix/web/components/decorators";

@BellatrixComponent
export class DateTimeInput extends WebComponent {
    async getTime(): Promise<Date> {
        // TODO: TEST
        const dateString = await this.getValue();
        return new Date(dateString);
    }

    async setTime(dateTime: Date): Promise<void> {
        await this.evaluate(el => el.value = dateTime.toDateString());
    }

    async getMax(): Promise<Date> {
        const dateString = await this.wrappedElement.getAttribute('max');
        return new Date(dateString);
    }

    async getMin(): Promise<Date> {
        const dateString = await this.wrappedElement.getAttribute('min');
        return new Date(dateString);
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
