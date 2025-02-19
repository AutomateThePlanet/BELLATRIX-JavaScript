import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Method, ParameterlessCtor } from '@bellatrix/core/types';
import { getMetadataFor } from '@bellatrix/core/utilities';
import { Internal } from '../test/_common';

function Ignore<
    ClassMethod extends (this: This, ...args: never) => void,
    This extends BellatrixTest = BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>,
>(testMethodOrClass: Class | ClassMethod, context: ClassMethodDecoratorContext | ClassDecoratorContext) {
    if (context.kind === 'class') {
        const testClass = testMethodOrClass as Class;
        const testMethods = Object.getOwnPropertyNames(testClass.prototype)
            .filter(method => typeof testClass.prototype[method] === 'function' &&
                getMetadataFor(testClass.prototype[method])?.[Internal.hasTestDecorator]);

        for (const testMethod of testMethods) {
            const testMetadata = getMetadataFor(testClass.prototype[testMethod]);

            testMetadata[Internal.shouldSkip] = true;
            return;
        }
    }

    if (context.kind === 'method') {
        const testMethod = testMethodOrClass as ClassMethod;
        const testMetadata = getMetadataFor(testMethod);

        testMetadata[Internal.shouldSkip] = true;
        return;
    }

    throw new Error(`invalid context '${context.kind}'.`);
}

export {
    Ignore,
    Ignore as ignore,
};
