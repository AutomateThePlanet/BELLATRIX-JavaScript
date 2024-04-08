import { WebComponent } from "@bellatrix/web/components";
import { WebService } from "."

import type { ReplaceType } from '@bellatrix/core/types'

export class ScriptService extends WebService {
    async execute<R, VarArgs extends any[] = []>(script: string | ((...args: {
        [K in keyof VarArgs]: ReplaceType<VarArgs[K], WebComponent, HTMLElement & { [key: string]: any }>
    }) => R), ...args: VarArgs): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof WebComponent) {
                await (args[i] as WebComponent).wait.toExist();
                args[i] = (args[i] as WebComponent).wrappedElement;
            }
        }

        return await this.driver.executeJavascript(script, ...args as any);
    }
}