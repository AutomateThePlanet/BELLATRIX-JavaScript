import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Option extends WebComponent {
    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    }

    async isSelected(): Promise<boolean> {
        return await this.wrappedElement.evaluate<boolean>('el => el.selected');
    }

    async select(): Promise<void> {
        await this.wrappedElement.evaluate<boolean>('el => el.selected = true');
        // TODO: validate if it succeeded
    }
}