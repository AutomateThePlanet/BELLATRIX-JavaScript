import { Symbols } from '@bellatrix/core/constants';
import { Plugin, PluginExecutionEngine } from '@bellatrix/core/infrastructure';

import type { InstanceOrParameterlessCtor } from '@bellatrix/core/types';

let isConfigExecuted = false;

export abstract class BellatrixTest {
    async configure(): Promise<void> {};
    async beforeAll(): Promise<void> {};
    async beforeEach(): Promise<void> {};
    async afterEach(): Promise<void> {};
    async afterAll(): Promise<void> {};

    async [Symbols.BEFORE_ALL](): Promise<void> {
        if (!isConfigExecuted) {
            await this.configure();
            isConfigExecuted = true;
        }

        await PluginExecutionEngine.executeBeforeSuiteHook(this.beforeAll.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.BEFORE_EACH](): Promise<void> {
        await PluginExecutionEngine.executeBeforeTestHook(this.beforeEach.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.AFTER_EACH](): Promise<void> {
        await PluginExecutionEngine.executeAfterTestHook(this.afterEach.bind(this), this.constructor as typeof BellatrixTest);
    }

    async [Symbols.AFTER_ALL](): Promise<void> {
        await PluginExecutionEngine.executeAfterSuiteHook(this.afterAll.bind(this), this.constructor as typeof BellatrixTest);
    }

    addPlugin(plugin: InstanceOrParameterlessCtor<Plugin>) {
        PluginExecutionEngine.addPlugin(plugin);
    }
}
