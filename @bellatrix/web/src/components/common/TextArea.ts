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
        return (await this.getAttribute('readonly')).toLowerCase() === 'true';
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async isRequired(): Promise<boolean> {
        return (await this.getAttribute('required')).toLowerCase() === 'true';
    }

    async isAutoComplete(): Promise<boolean> {
        return (await this.getAttribute('autocomplete')).toLowerCase() === 'true';
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }

    async getMinLength(): Promise<number> {
        return parseInt(await this.getAttribute('min'));
    }

    async getMaxLength(): Promise<number> {
        return parseInt(await this.getAttribute('max'));
    }

    async getPlaceholder(): Promise<string> {
        return await this.getAttribute('placeholder');
    }

    async getRows(): Promise<number> {
        return parseInt(await this.getAttribute('rows'));
    }
    
    async getCols(): Promise<number> {
        return parseInt(await this.getAttribute('cols'));
    }

    async getSpellCheck(): Promise<string> {
        return await this.getAttribute('spellcheck');
    }

    async getWrap(): Promise<TextAreaWrap> {
        return await this.getAttribute('wrap') as TextAreaWrap;
    }
}