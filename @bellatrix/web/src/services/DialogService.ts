import { WebService } from "./WebService";

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
}