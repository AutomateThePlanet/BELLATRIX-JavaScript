import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

import type { TextAreaWrap } from '@bellatrix/web/types';

@BellatrixComponent
export class TextArea extends WebComponent<HTMLTextAreaElement> {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async setText(text: string): Promise<void> {
        await this.wrappedElement.setText(text);
    }

    async isReadOnly(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('readonly')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('autocomplete')).toLowerCase() === 'true';
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

    async getPlaceholder(): Promise<string> {
        return await this.wrappedElement.getAttribute('placeholder');
    }

    async getRows(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('rows'));
    }
    
    async getCols(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('cols'));
    }

    async getSpellCheck(): Promise<string> {
        return await this.wrappedElement.getAttribute('spellcheck');
    }

    async getWrap(): Promise<TextAreaWrap> {
        return await this.wrappedElement.getAttribute('wrap') as TextAreaWrap;
    }
}