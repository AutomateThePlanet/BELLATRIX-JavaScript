import { App } from '@bellatrix/web/infrastructure';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { BrowserWorkflowPlugin } from '@bellatrix/web/plugins';

export abstract class WebTest extends BellatrixTest {
    get app(): App { return ServiceLocator.resolve(App) }

    override async configure(): Promise<void> {
        await super.configure();
        this.addPlugin(BrowserWorkflowPlugin);
    }
}
