import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class RangeInput extends WebComponent<HTMLInputElement> {
    async getRange(): Promise<number> {
        return this.evaluate(el => el.valueAsNumber);
    }

    async setRange(range: number): Promise<void> {
        await this.evaluate(el => el.value = `${range}`);
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

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }
}
