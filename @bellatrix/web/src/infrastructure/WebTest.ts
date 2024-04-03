import { App } from '@bellatrix/web/infrastructure';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixTest } from '@bellatrix/core/infrastructure';

export abstract class WebTest extends BellatrixTest {
    get app(): App { return ServiceLocator.resolve(App) }

    override async configure(): Promise<void> {
        await super.configure();
        // TODO: register browser lifecycle plugin
    }
}
