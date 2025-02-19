import { BellatrixTest } from '@bellatrix/core/infrastructure';
export type TestResult = 'success' | 'failure' | 'unknown';
export type TestFramework = 'vitest' | 'playwright';
export type TestReporter = 'console-only' | 'json' | 'junit' | 'tap';

import type { ParameterlessCtor, Result } from '.';

export type TestFunction<TestProps, R = unknown> = (props: TestProps) => Result<R>;

export type TestDecorator<
    This extends BellatrixTest = BellatrixTest,
    Args extends unknown[] = unknown[],
    ClassMethod extends (this: This, ...args: Args) => void = (this: This, ...args: Args) => Result<void>
> = (target: ClassMethod, context: ClassMethodDecoratorContext<This, ClassMethod>) => void;

export type TestSuiteDecorator<
    This extends BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>
> = (target: Class, context: ClassDecoratorContext<Class>) => void;
