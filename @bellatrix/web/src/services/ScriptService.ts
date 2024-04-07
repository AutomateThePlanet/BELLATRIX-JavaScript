import { WebService } from "."

export class ScriptService extends WebService {
    async execute<T, VarArgs extends any[] = []>(script: string | ((...args: VarArgs) => T), ...args: VarArgs): Promise<T> {
        return await this.driver.executeJavascript(script, ...args);
    }

    // TODO: the inner logic behind evaluate() methods for WebElement?
    // TODO: the conversion logic between executing script for selenium/playwright
}