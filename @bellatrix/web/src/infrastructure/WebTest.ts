import { App } from '@bellatrix/web/infrastructure';
import { resolve } from '@bellatrix/core/utilities';
import { addPlugin, BellatrixTest } from '@bellatrix/core/infrastructure';
import { BrowserWorkflowPlugin } from '@bellatrix/web/plugins';

export abstract class WebTest extends BellatrixTest {
    get app(): App { return resolve(App); }

    override async configure(): Promise<void> {
        await super.configure();
        addPlugin(BrowserWorkflowPlugin);
    }
}
