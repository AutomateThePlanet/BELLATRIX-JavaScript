import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixTest, Plugin } from '.';

import type { InstanceOrParameterlessCtor, ParameterlessCtor } from '@bellatrix/core/types';

import { currentTestStore, suiteMetadataStore, testMetadataStore } from '../test/_common';

export class PluginExecutionEngine {
    private constructor() {
        throw new Error('PluginExecutionEngine is static and cannot be instantiated');
    }

    static addPlugin<T extends Plugin>(plugin: InstanceOrParameterlessCtor<T>): void {
        ServiceLocator.registerSingleton(Plugin, plugin instanceof Plugin ? plugin : new plugin);
    }

    static async executeBeforeSuiteHook<T>(beforeSuiteFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
        const suiteMetadata = suiteMetadataStore.get(testClass)!;

        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preBeforeSuite(suiteMetadata));
            const result: T = await beforeSuiteFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postBeforeSuite(suiteMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.onBeforeSuiteError(suiteMetadata, error as Error));
            throw error;
        }
    }

    static async executeBeforeTestHook<T>(beforeTestFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
        const currentTest = currentTestStore.get(testClass)!;

        if (!currentTest?.method) {
            throw new Error('Could not determine test during afterTest hook');
        }

        const testMetadata = testMetadataStore.get(currentTest.method)!;
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preBeforeTest(testMetadata));
            const result = await beforeTestFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postBeforeTest(testMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.onBeforeTestError(testMetadata, error as Error));
            throw error;
        }
    }

    static async executeAfterTestHook<T>(afterTestFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
        const currentTest = currentTestStore.get(testClass)!;

        if (!currentTest?.method) {
            throw new Error('Could not determine test during afterTest hook');
        }

        const testMetadata = testMetadataStore.get(currentTest.method)!;
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preAfterTest(testMetadata));
            const result = await afterTestFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postAfterTest(testMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.onAfterTestError(testMetadata, error as Error));
            throw error;
        }
    }

    static async executeAfterSuiteHook<T>(afterSuiteFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
        const suiteMetadata = suiteMetadataStore.get(testClass)!;

        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preAfterSuite(suiteMetadata));
            const result: T = await afterSuiteFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postAfterSuite(suiteMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.onAfterSuiteError(suiteMetadata, error as Error));
            throw error;
        }
    }

    private static async executeAll(plugin: (plugin: Plugin) => Promise<void>): Promise<void> {
        const plugins = ServiceLocator.resolveAll(Plugin);
        await Promise.all(plugins.map(plugin));
    }
}
