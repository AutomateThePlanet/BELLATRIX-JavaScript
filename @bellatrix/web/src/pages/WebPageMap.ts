import { ServiceLocator } from "@bellatrix/core/utilities";
import { ComponentService } from "@bellatrix/web/services";

export abstract class WebPageMap {
    protected get components(): ComponentService {
        return ServiceLocator.resolve(ComponentService);
    }
}