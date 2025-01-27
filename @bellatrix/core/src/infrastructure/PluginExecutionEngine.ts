import { TestMetadata, getCurrentTest, getSuiteMetadata, getTestMetadata } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { BellatrixTest, Plugin } from '.';

import type { InstanceOrParameterlessCtor } from '@bellatrix/core/types';

export class PluginExecutionEngine {
    private constructor() {
        throw new Error('PluginExecutionEngine is static and cannot be instantiated');
    }

    static addPlugin<T extends Plugin>(plugin: InstanceOrParameterlessCtor<T>): void {
        ServiceLocator.registerSingleton(Plugin, plugin instanceof Plugin ? plugin : new plugin);
    }

    static async executeBeforeSuiteHook<T>(beforeSuiteFn: Function | undefined, testClass: typeof BellatrixTest): Promise<T> {
        const suiteMetadata = getSuiteMetadata(testClass);
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preBeforeSuite(suiteMetadata));
            const result: T = await beforeSuiteFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postBeforeSuite(suiteMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.beforeSuiteFailed(suiteMetadata, error as Error));
            throw error;
        }
    }

    static async executeBeforeTestHook<T>(beforeTestFn: Function | undefined, testClass: typeof BellatrixTest): Promise<T> {
        const testMetadata = getTestMetadata(getCurrentTest(testClass).method);
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preBeforeTest(testMetadata));
            const result = await beforeTestFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postBeforeTest(testMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.beforeTestFailed(testMetadata, error as Error));
            throw error;
        }
    }

    static async executeAfterTestHook<T>(afterTestFn: Function | undefined, testClass: typeof BellatrixTest): Promise<T> {
        const testMetadata = getTestMetadata(getCurrentTest(testClass).method);
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preAfterTest(testMetadata));
            const result = await afterTestFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postAfterTest(testMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.afterTestFailed(testMetadata, error as Error));
            throw error;
        }
    }

    static async executeAfterSuiteHook<T>(afterSuiteFn: Function | undefined, testClass: typeof BellatrixTest): Promise<T> {
        const suiteMetadata = getSuiteMetadata(testClass);
        try {
            await PluginExecutionEngine.executeAll(plugin => plugin.preAfterSuite(suiteMetadata));
            const result: T = await afterSuiteFn?.();
            await PluginExecutionEngine.executeAll(plugin => plugin.postAfterSuite(suiteMetadata));
            return result;
        } catch (error) {
            await PluginExecutionEngine.executeAll(plugin => plugin.afterSuiteFailed(suiteMetadata, error as Error));
            throw error;
        }
    }

    private static async executeAll(plugin: (plugin: Plugin) => Promise<void>): Promise<void> {
        const plugins = ServiceLocator.resolveAll(Plugin);
        await Promise.all(plugins.map(plugin));
    }
}
