import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Internal, initMetadata, suiteMetadataStore, testMetadataStore } from '../test/_common';

import type { Method, ParameterlessCtor, SuiteMetadata, TestMetadata } from '@bellatrix/core/types';

export function getMetadataFor<
    This extends BellatrixTest = BellatrixTest,
    ClassMethod extends Method<This> = Method<This>
>(testMethod: ClassMethod): Exclude<TestMetadata, 'suiteName' | 'suiteClass'>
export function getMetadataFor<
    This extends BellatrixTest = BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>
>(testClass: Class): SuiteMetadata
export function getMetadataFor<
    This extends BellatrixTest = BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>,
    ClassMethod extends Method<This> = Method<This>
>(testMethodOrClass: ClassMethod | Class): Exclude<TestMetadata, 'suiteName' | 'suiteClass'> | SuiteMetadata {
    if (isConstructor(testMethodOrClass)) {
        const testClass = testMethodOrClass as Class;
        if (!suiteMetadataStore.has(testClass)) {
            suiteMetadataStore.set(testClass, initMetadata(Internal.suiteMetadata, testClass));
        }

        return testMetadataStore.get(testClass) as SuiteMetadata;
    }

    const testMethod = testMethodOrClass as ClassMethod;
    if (!testMetadataStore.has(testMethod)) {
        testMetadataStore.set(testMethod, initMetadata(Internal.testMetadata, testMethod));
    }

    return testMetadataStore.get(testMethod) as Exclude<TestMetadata, 'suiteName' | 'suiteClass'>;
}

export function isConstructor(constructor: unknown) {
    try {
        Reflect.construct(String, [], constructor as new (...args: never) => never);
    } catch (e) {
        return false;
    }
    return true;
}

export function decodeHtml(encodedString: string) {
    const translateRegex = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        'nbsp': ' ',
        'amp' : '&',
        'quot': '"',
        'lt'  : '<',
        'gt'  : '>'
    } as const;

    return encodedString.replace(translateRegex, (_, entity: keyof typeof translate) => {
        return translate[entity];
    }).replace(/&#(\d+);/gi, (_, numStr) => {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    }).replace(/&#x(\d+);/gi, (_, numStr) => {
        const num = parseInt(numStr, 16);
        return String.fromCharCode(num);
    });
}
