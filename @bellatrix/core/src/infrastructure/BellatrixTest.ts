import { Internal, currentTestStore, suiteMetadataStore, testMetadataStore } from '../test/_common';
import { resolveAll } from '@bellatrix/core/utilities';
import { Plugin } from '.';

import type { ParameterlessCtor } from '@bellatrix/core/types';

let isConfigExecuted = false;

export abstract class BellatrixTest {
    async configure(): Promise<void> {};
    async beforeAll(): Promise<void> {};
    async beforeEach(): Promise<void> {};
    async afterEach(): Promise<void> {};
    async afterAll(): Promise<void> {};

    async [Internal.beforeAll](): Promise<void> {
        if (!isConfigExecuted) {
            await this.configure();
            isConfigExecuted = true;
        }

        await executeBeforeSuiteHook(this.beforeAll.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [Internal.beforeEach](): Promise<void> {
        await executeBeforeTestHook(this.beforeEach.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [Internal.afterEach](): Promise<void> {
        await executeAfterTestHook(this.afterEach.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    async [Internal.afterAll](): Promise<void> {
        await executeAfterSuiteHook(this.afterAll.bind(this), this.constructor as ParameterlessCtor<BellatrixTest>);
    }

    _() { } // dummy method to avoid TS error in getMetadata
}

export abstract class TestProps { }

async function executeBeforeSuiteHook<T>(beforeSuiteFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
    const suiteMetadata = suiteMetadataStore.get(testClass)!;

    try {
        await executeAll(plugin => plugin.preBeforeSuite(suiteMetadata));
        const result: T = await beforeSuiteFn?.();
        await executeAll(plugin => plugin.postBeforeSuite(suiteMetadata));
        return result;
    } catch (error) {
        await executeAll(plugin => plugin.onBeforeSuiteError(suiteMetadata, error as Error));
        throw error;
    }
}

async function executeBeforeTestHook<T>(beforeTestFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
    const currentTest = currentTestStore.get(testClass)!;

    if (!currentTest?.method) {
        throw new Error('Could not determine test during afterTest hook');
    }

    const testMetadata = testMetadataStore.get(currentTest.method)!;
    try {
        await executeAll(plugin => plugin.preBeforeTest(testMetadata));
        const result = await beforeTestFn?.();
        await executeAll(plugin => plugin.postBeforeTest(testMetadata));
        return result;
    } catch (error) {
        await executeAll(plugin => plugin.onBeforeTestError(testMetadata, error as Error));
        throw error;
    }
}

async function executeAfterTestHook<T>(afterTestFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
    const currentTest = currentTestStore.get(testClass)!;

    if (!currentTest?.method) {
        throw new Error('Could not determine test during afterTest hook');
    }

    const testMetadata = testMetadataStore.get(currentTest.method)!;
    try {
        await executeAll(plugin => plugin.preAfterTest(testMetadata));
        const result = await afterTestFn?.();
        await executeAll(plugin => plugin.postAfterTest(testMetadata));
        return result;
    } catch (error) {
        await executeAll(plugin => plugin.onAfterTestError(testMetadata, error as Error));
        throw error;
    }
}

async function executeAfterSuiteHook<T>(afterSuiteFn: Function | undefined, testClass: ParameterlessCtor<BellatrixTest>): Promise<T> {
    const suiteMetadata = suiteMetadataStore.get(testClass)!;

    try {
        await executeAll(plugin => plugin.preAfterSuite(suiteMetadata));
        const result: T = await afterSuiteFn?.();
        await executeAll(plugin => plugin.postAfterSuite(suiteMetadata));
        return result;
    } catch (error) {
        await executeAll(plugin => plugin.onAfterSuiteError(suiteMetadata, error as Error));
        throw error;
    }
}

async function executeAll(plugin: (plugin: Plugin) => Promise<void>): Promise<void> {
    const plugins = resolveAll(Plugin);
    await Promise.all(plugins.map(plugin));
}
