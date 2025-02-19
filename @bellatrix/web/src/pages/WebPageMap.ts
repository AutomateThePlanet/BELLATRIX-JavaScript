import { Ctor } from '@bellatrix/core/types';
import { ComponentService } from '@bellatrix/web/services';
import { WebComponent } from '@bellatrix/web/components';
import { resolve } from '@bellatrix/core/utilities';
import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';

export abstract class WebPageMap {
    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(resolve(BrowserController), type);
    }
}
