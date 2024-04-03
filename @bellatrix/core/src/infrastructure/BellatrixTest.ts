import { Symbols } from '@bellatrix/core/constants';
import { PluginExecutionEngine } from '@bellatrix/core/infrastructure';

let isConfigExecuted = false;

export abstract class BellatrixTest {
    async configure(): Promise<void> {};
    async beforeAll(): Promise<void> {};
    async beforeEach(): Promise<void> {};
    async afterEach(): Promise<void> {};
    async afterAll(): Promise<void> {};

    async [Symbols.beforeAll](): Promise<void> {
        if (!isConfigExecuted) {
            await this.configure();
            isConfigExecuted = true;
        }

        await PluginExecutionEngine.executeBeforeSuiteHook(this.beforeAll.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.beforeEach](): Promise<void> {
        await PluginExecutionEngine.executeBeforeTestHook(this.beforeEach.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.afterEach](): Promise<void> {
        await PluginExecutionEngine.executeAfterTestHook(this.afterEach.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.afterAll](): Promise<void> {
        await PluginExecutionEngine.executeAfterSuiteHook(this.afterAll.bind(this), this.constructor as typeof BellatrixTest);
    }
}