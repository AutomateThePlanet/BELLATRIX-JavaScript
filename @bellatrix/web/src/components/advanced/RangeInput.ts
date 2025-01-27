import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class RangeInput extends WebComponent<HTMLInputElement> {
    async getValue(): Promise<number> {
        return this.evaluate(el => el.valueAsNumber);
    }

    async setValue(value: number): Promise<void> {
        await this.evaluate(el => el.value = String(value));
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getList(): Promise<string> {
        return await this.getAttribute('list');
    }

    async getMin(): Promise<number> {
        return parseFloat(await this.getAttribute('min'));
    }

    async getMax(): Promise<number> {
        return parseFloat(await this.getAttribute('max'));
    }

    async isRequired(): Promise<boolean> {
        return (await this.getAttribute('required')).toLowerCase() === 'true';
    }

    async getStep(): Promise<number> {
        return parseFloat(await this.getAttribute('step'));
    }
}
