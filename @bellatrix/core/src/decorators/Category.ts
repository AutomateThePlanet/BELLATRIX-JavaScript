import { Symbols } from '@bellatrix/core/constants';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { defineTestMetadata, getTestMetadata, TestMetadata } from '@bellatrix/core/test/props';
import { MethodNames, ParameterlessCtor } from '@bellatrix/core/types';

export function Category<T extends BellatrixTest>(name: string): (target: ParameterlessCtor<T>) => void {
    return (target: ParameterlessCtor<T>) => {
        const testClass = target.prototype;
        const testMethods = Object.getOwnPropertyNames(testClass).filter(method => typeof testClass[method] === 'function' && Reflect.hasMetadata(Symbols.TEST, testClass[method]));

        for (const testMethod of testMethods) {
            const metadata = getTestMetadata(testClass[testMethod]);

            if (metadata.customData.has('category')) {
                const categories = metadata.customData.get('category');
                if (!Array.isArray(categories)) {
                    metadata.customData.set('category', [categories, name]);
                } else {
                    categories.push(name);
                }
            } else {
                metadata.customData.set('category', name);
            }
        }
    };
}

export function TestCategory<T extends BellatrixTest>(name: string): <K extends keyof T>(testClass: T, methodName: string) => void {
    return (testClass: T, methodName: string) => {
        let metadata = getTestMetadata(testClass[methodName as keyof T] as (...args: unknown[]) => (Promise<void> | void));

        if (!metadata) {
            defineTestMetadata(testClass[methodName as keyof T] as (...args: unknown[]) => (Promise<void> | void), testClass.constructor as ParameterlessCtor<T>);
            metadata = getTestMetadata(testClass[methodName as keyof T] as (...args: unknown[]) => (Promise<void> | void));
        }

        if (metadata.customData.has('category')) {
            const categories = metadata.customData.get('category');
            if (!Array.isArray(categories)) {
                metadata.customData.set('category', [categories, name]);
            } else {
                categories.push(name);
            }
        } else {
            metadata.customData.set('category', name);
        }
    };
}
