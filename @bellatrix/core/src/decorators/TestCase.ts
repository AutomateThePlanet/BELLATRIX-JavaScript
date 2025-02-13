import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { DecoratorUtilities } from '@bellatrix/core/utilities';
import { BellatrixSymbol } from '../test/_common';

function TestCase<
    ClassMethod extends (this: This, ...args: never) => void,
    This extends BellatrixTest = BellatrixTest,
>(...args: Parameters<ClassMethod>) {
    return function(testMethodOrClass: ClassMethod, context: ClassMethodDecoratorContext) {
        if (context.kind === 'method') {
            const testMethod = testMethodOrClass as ClassMethod;
            const testMetadata = DecoratorUtilities.getMetadata(testMethod);

            testMetadata[BellatrixSymbol.hasTestDecorator] = true;
            testMetadata[BellatrixSymbol.testCaseArgs].push(args);
            return;
        }
    };
}

export {
    TestCase,
    TestCase as testCase,
};
