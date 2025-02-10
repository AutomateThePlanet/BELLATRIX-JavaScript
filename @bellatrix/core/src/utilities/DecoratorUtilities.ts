import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Utilities } from '.';

import type { Method, ParameterlessCtor, SuiteMetadata, TestMetadata } from '@bellatrix/core/types';

import { BellatrixSymbol, initMetadata, suiteMetadataStore, testMetadataStore } from '../test/_common';

export class DecoratorUtilities {
    private constructor() { throw new Error('ServiceLocator is static and cannot be instantiated'); }

    static getMetadata<
        This extends BellatrixTest = BellatrixTest,
        ClassMethod extends Method<This> = Method<This>
    >(testMethod: ClassMethod): Exclude<TestMetadata, 'suiteName' | 'suiteClass'>
    static getMetadata<
        This extends BellatrixTest = BellatrixTest,
        Class extends ParameterlessCtor<This> = ParameterlessCtor<This>
    >(testClass: Class): SuiteMetadata
    static getMetadata<
        This extends BellatrixTest = BellatrixTest,
        Class extends ParameterlessCtor<This> = ParameterlessCtor<This>,
        ClassMethod extends Method<This> = Method<This>
    >(testMethodOrClass: ClassMethod | Class): Exclude<TestMetadata, 'suiteName' | 'suiteClass'> | SuiteMetadata {
        if (Utilities.isConstructor(testMethodOrClass)) {
            const testClass = testMethodOrClass as Class;
            if (!suiteMetadataStore.has(testClass)) {
                suiteMetadataStore.set(testClass, initMetadata(BellatrixSymbol.suiteMetadata, testClass));
            }

            return testMetadataStore.get(testClass) as SuiteMetadata;
        }

        const testMethod = testMethodOrClass as ClassMethod;
        if (!testMetadataStore.has(testMethod)) {
            testMetadataStore.set(testMethod, initMetadata(BellatrixSymbol.testMetadata, testMethod));
        }

        return testMetadataStore.get(testMethod) as Exclude<TestMetadata, 'suiteName' | 'suiteClass'>;
    }
}
