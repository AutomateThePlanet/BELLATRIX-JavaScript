import { Plugin } from '@bellatrix/core/infrastructure';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { TestExecutionEngine } from '@bellatrix/web/infrastructure';

export class BrowserWorkflowPlugin extends Plugin {
    private isStarted: boolean = false;

    override async preBeforeSuite(): Promise<void> {
        if (this.isStarted) {
            throw Error('Browser session already started.');
        }
        await TestExecutionEngine.startBrowser();
        this.isStarted = true;
    }

    override async postAfterSuite(): Promise<void> {
        if (this.isStarted) {
            await TestExecutionEngine.dispose();
            this.isStarted = false;
        }
    }
}