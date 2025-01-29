import { BellatrixWebService } from '@bellatrix/web/services/decorators';
import { WebService } from '.';

@BellatrixWebService
export class DialogService extends WebService {
    async accept(promptText?: string | undefined): Promise<void> {
        await this.driver.acceptDialog(promptText);
    }

    async dismiss(): Promise<void> {
        await this.driver.dismissDialog();
    }

    async getMessage(): Promise<string> {
        return await this.driver.getDialogMessage();
    }

    async handle(action: (dialog: DialogService) => void): Promise<void> {
        await action(this);
    }
}
