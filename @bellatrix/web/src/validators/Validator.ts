import { ServiceLocator } from "@bellatrix/core/utilities";
import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { StringValidator, NumberValidator, BooleanValidator, UnknownValidator } from ".";
import { BellatrixSettings } from "@bellatrix/core/settings";
import { Assert, is } from "@bellatrix/core/assertions";

export class Validator implements StringValidator, NumberValidator, BooleanValidator, UnknownValidator {
    private _method: Function;
    private _attribute: string;

    constructor(method: Function, attribute: string) {
        this._method = method;
        this._attribute = attribute;
    }

    async is(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();
    
                switch (typeof result) {
                    case 'string':
                        return result === expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with StringValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.areEqual(expected, result, `Validating ${this._attribute}.`);
        }
    }

    async equals(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result === expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.areEqual(expected, result, `Validating ${this._attribute}.`);
        }
    }

    async notEqual(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result !== expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.areNotEqual(expected, result, `Validating ${this._attribute}.`);
        }
    }

    async isNot(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'string': {
                        return result !== expected;
                    }
                    default:
                        throw Error(`Tried to validate ${typeof result} with StringValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.areNotEqual(expected, result, `Validating ${this._attribute}.`);
        }
    }

    async contains(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'string':
                        return result.includes(expected);
                    default:
                        throw Error(`Tried to validate ${typeof result} with StringValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.areNotEqual(expected, result, `Validating ${this._attribute}.`);
        }
    }

    async isGreaterThan(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result > expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.that(result, { message: `Validating ${this._attribute}.` }, is.greaterThan(expected));
        }
    }

    async isLessThan(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result < expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.that(result, { message: `Validating ${this._attribute}.` }, is.lessThan(expected));
        }
    }

    async isGreaterThanOrEqual(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result >= expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.that(result, { message: `Validating ${this._attribute}.` }, is.greaterThanOrEqualTo(expected));
        }
    }

    async isLessThanOrEqual(expected: any): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'number':
                        return result <= expected;
                    default:
                        throw Error(`Tried to validate ${typeof result} with NumberValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.that(result, { message: `Validating ${this._attribute}.` }, is.lessThanOrEqualTo(expected));
        }
    }

    async isTrue(): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'boolean':
                        return result === true;
                    case 'string':
                        return result === 'true';
                    default:
                        throw Error(`Tried to validate ${typeof result} with BooleanValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.isTrue(typeof result === 'string' ? Boolean(result) : result as unknown as boolean, `Validating ${this._attribute}.`)
        }
    }

    async isFalse(): Promise<void> {
        const validationTimeout = BellatrixSettings.get().webSettings.timeoutSettings.validationTimeout;
        const sleepInterval = BellatrixSettings.get().webSettings.timeoutSettings.sleepInterval;
        let result;
        try {
            await this.driver.waitUntil(async () => {
                result = await this.getResult();

                switch (typeof result) {
                    case 'boolean':
                        return result === false;
                    case 'string':
                        return result === 'false';
                    default:
                        throw Error(`Tried to validate ${typeof result} with BooleanValidator`);
                }
            }, validationTimeout, sleepInterval);
        } catch {
            Assert.isFalse(typeof result === 'string' ? Boolean(result) : result as unknown as boolean, `Validating ${this._attribute}.`)
        }
    }

    private get driver(): BrowserAutomationTool {
        return ServiceLocator.resolve(BrowserAutomationTool);
    }

    private async getResult(): Promise<any> {
        // @ts-ignore
        return this._method[Symbol.toStringTag] === 'AsyncFunction' ? await this._method() : this._method();
    }
}