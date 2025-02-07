import { Plugin, PluginExecutionEngine } from '@bellatrix/core/infrastructure';

import type { InstanceOrParameterlessCtor, ParameterlessCtor } from '@bellatrix/core/types';

import { BellatrixSymbol } from '../test/_common';

let isConfigExecuted = false;

export abstract class BellatrixTest {
    async configure(): Promise<void> {};
    async beforeAll(): Promise<void> {};
    async beforeEach(): Promise<void> {};
    async afterEach(): Promise<void> {};
    async afterAll(): Promise<void> {};

    async [BellatrixSymbol.beforeAll](): Promise<void> {
        if (!isConfigExecuted) {
            await this.configure();
            isConfigExecuted = true;
        }

        await PluginExecutionEngine.executeBeforeSuiteHook(this.beforeAll.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [BellatrixSymbol.beforeEach](): Promise<void> {
        await PluginExecutionEngine.executeBeforeTestHook(this.beforeEach.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [BellatrixSymbol.afterEach](): Promise<void> {
        await PluginExecutionEngine.executeAfterTestHook(this.afterEach.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [BellatrixSymbol.afterAll](): Promise<void> {
        await PluginExecutionEngine.executeAfterSuiteHook(this.afterAll.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    addPlugin(plugin: InstanceOrParameterlessCtor<Plugin>) {
        PluginExecutionEngine.addPlugin(plugin);
    }
}

export abstract class TestProps { }
