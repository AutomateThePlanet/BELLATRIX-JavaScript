import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Option extends WebComponent<HTMLOptionElement> {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getValue(): Promise<string> {
        return await this.getAttribute('value');
    }

    async isSelected(): Promise<boolean> {
        return await this.evaluate(el => el.selected);
    }

    async select(): Promise<void> {
        await this.evaluate(el => el.selected = true);
        // TODO: validate if it succeeded
    }
}