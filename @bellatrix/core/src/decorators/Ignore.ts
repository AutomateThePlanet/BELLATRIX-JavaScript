import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Method, ParameterlessCtor } from '@bellatrix/core/types';
import { DecoratorUtilities } from '@bellatrix/core/utilities';
import { BellatrixSymbol } from '../test/_common';

function Ignore<
    This extends BellatrixTest = BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>,
    ClassMethod extends Method<This> = Method<This>
>(testMethodOrClass: Class | ClassMethod, context: ClassMethodDecoratorContext | ClassDecoratorContext) {
    if (context.kind === 'class') {
        const testClass = testMethodOrClass as Class;
        const testMethods = Object.getOwnPropertyNames(testClass.prototype)
            .filter(method => typeof testClass.prototype[method] === 'function' &&
                DecoratorUtilities.getMetadata(testClass.prototype[method])?.[BellatrixSymbol.hasTestDecorator]);

        for (const testMethod of testMethods) {
            const testMetadata = DecoratorUtilities.getMetadata(testClass.prototype[testMethod]);

            testMetadata.shouldSkip = true;
            return;
        }
    }

    if (context.kind === 'method') {
        const testMethod = testMethodOrClass as ClassMethod;
        const testMetadata = DecoratorUtilities.getMetadata(testMethod);

        testMetadata.shouldSkip = true;
        return;
    }

    throw new Error(`invalid context '${context.kind}'.`);
}

export {
    Ignore,
    Ignore as ignore,
};
