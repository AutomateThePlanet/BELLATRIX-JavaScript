import { WebComponent } from '@bellatrix/web/components';
import { WebService } from '.';

export class ScriptService extends WebService {
    async execute<R, VarArgs extends unknown[] = []>(script: string | ((...args: {
        [K in keyof VarArgs]: VarArgs[K] extends WebComponent<infer T> ? T : VarArgs[K]
    }) => R), ...args: VarArgs): Promise<R> {
        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof WebComponent) {
                await (args[i] as WebComponent).wait.toExist();
                args[i] = (args[i] as WebComponent).wrappedElement;
            }
        }

        return await this.driver.executeJavascript(script, ...args as never);
    }
}
