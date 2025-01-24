import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class NumberInput extends WebComponent<HTMLInputElement> {
    async getNumber(): Promise<number> {
        return parseFloat(await this.getValue());
    }

    async setNumber(number: number): Promise<void> {
        await this.wrappedElement.setText(`${number}`);
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async getMin(): Promise<number> {
        return parseFloat(await this.getAttribute('min'));
    }

    async getMax(): Promise<number> {
        return parseFloat(await this.getAttribute('max'));
    }

    async getPlaceholder(): Promise<string> {
        return await this.getAttribute('placeholder');
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

    async getSize(): Promise<number> {
        return parseInt(await this.getAttribute('size'));
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }
}
