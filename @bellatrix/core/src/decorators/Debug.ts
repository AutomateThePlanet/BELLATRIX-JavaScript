import { Symbols } from '@bellatrix/core/constants';
import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { getTestMetadata } from '@bellatrix/core/test/props';
import { ParameterlessCtor } from '@bellatrix/core/types';

export function Debug<T extends BellatrixTest>(target: T, methodName: string): void;
export function Debug<T extends BellatrixTest>(target: ParameterlessCtor<T>): void;
export function Debug<T extends BellatrixTest>(target: T | ParameterlessCtor<T>, methodName?: string): void {
    if (typeof target === 'function') {
        const testClass = target.prototype;
        const testMethods = Object.getOwnPropertyNames(testClass).filter(method => typeof testClass[method] === 'function' && Reflect.hasMetadata(Symbols.TEST, testClass[method]));

        for (const testMethod of testMethods) {
            const metadata = getTestMetadata(testClass[testMethod], testClass);
            metadata.only = true;
        }
    } else {
        const metadata = getTestMetadata(target[methodName as keyof T] as (...args: unknown[]) => (Promise<void> | void), target.constructor as ParameterlessCtor<T>);
        metadata.only = true;
        console.log(metadata);
    }
}
