import { Ctor } from "@bellatrix/core/types";
import { ComponentService } from "@bellatrix/web/services";
import { WebComponent } from "@bellatrix/web/components";
import { ServiceLocator } from "@bellatrix/core/utilities";
import { BrowserAutomationTool } from "infrastructure/browserautomationtools/core";

export abstract class WebPageMap {
    create<T extends WebComponent>(type: Ctor<T, ConstructorParameters<typeof WebComponent>>) {
        return new ComponentService(ServiceLocator.resolve(BrowserAutomationTool), type);
    }
}