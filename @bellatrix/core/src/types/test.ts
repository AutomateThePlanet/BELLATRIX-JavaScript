import { PluginExecutionEngine, BellatrixTest } from '@bellatrix/core/infrastructure';
export type TestResult = 'success' | 'failure' | 'unknown';
export type TestFramework = 'jasmine' | 'jest' | 'mocha' | 'vitest' | 'playwright';
export type TestReporter = 'console-only' | 'json' | 'junit' | 'trx' | 'nunit' | 'xunit' | 'tap';

import type { MethodNames, ParameterlessCtor, Result, StaticMethod } from '.';

export type TestDecoratorImpl<T extends BellatrixTest> = <K extends string>(target: T, method: K extends MethodNames<T> ? never : K) => void;
export type TestFunction<T> = (name: string, fn: TestFn<T>) => void;
export type TestSuiteDecorator<T extends BellatrixTest> = (target: ParameterlessCtor<T>) => void;

export type ConfigureProps = {
    addPlugin: StaticMethod<typeof PluginExecutionEngine.addPlugin>;
}

export type TestFn<T, R = unknown> = (props: T) => Result<R>;
export type ConfigureFn = (props: ConfigureProps) => Result<void>;

