import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { getMetadataFor } from '@bellatrix/core/utilities';
import { Internal } from '../test/_common';

function TestCase<
    ClassMethod extends (this: This, ...args: never) => void,
    This extends BellatrixTest = BellatrixTest,
>(...args: Parameters<ClassMethod>) {
    return function(testMethodOrClass: ClassMethod, context: ClassMethodDecoratorContext) {
        if (context.kind === 'method') {
            const testMethod = testMethodOrClass as ClassMethod;
            const testMetadata = getMetadataFor(testMethod);

            testMetadata[Internal.hasTestDecorator] = true;
            testMetadata[Internal.testCaseArgs].push(args);
            return;
        }
    };
}

export {
    TestCase,
    TestCase as testCase,
};
