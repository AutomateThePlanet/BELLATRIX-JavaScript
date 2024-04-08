import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class TextField extends WebComponent<HTMLInputElement> {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }

    async setText(text: string): Promise<void> {
        await this.wrappedElement.setText(text);
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

    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    }

    async getMinLength(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('min'));
    }

    async getMaxLength(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('max'));
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async getPlaceholder(): Promise<string> {
        return await this.wrappedElement.getAttribute('placeholder');
    }

    async getSize(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('size'));
    }
}