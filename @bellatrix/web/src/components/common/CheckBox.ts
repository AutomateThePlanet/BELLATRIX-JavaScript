import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class CheckBox extends WebComponent {
    async check(): Promise<void> {
        return await this.wrappedElement.setChecked(true);
    }

    async uncheck(): Promise<void> {
        return await this.wrappedElement.setChecked(false);
    }

    async isChecked(): Promise<boolean> {
        return await this.wrappedElement.isChecked();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    }
}