import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { getTestMetadata } from '@bellatrix/core/test/props';
import { ParameterlessCtor } from '@bellatrix/core/types';

export function Debug<T extends BellatrixTest>(target: T, methodName?: string): void {
    const metadata = getTestMetadata(target[methodName as keyof T] as (...args: unknown[]) => (Promise<void> | void), target.constructor as ParameterlessCtor<T>);
    metadata.only = true;
}
