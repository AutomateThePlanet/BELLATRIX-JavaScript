import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Method, ParameterlessCtor } from '@bellatrix/core/types';
import { getMetadataFor } from '@bellatrix/core/utilities';
import { Internal } from '../test/_common';

const categoryKeyword = 'category';

function Category<
    This extends BellatrixTest = BellatrixTest,
    Class extends ParameterlessCtor<This> = ParameterlessCtor<This>,
    ClassMethod extends Method<This> = Method<This>
>(name: string) {
    return function(testMethodOrClass: Class | ClassMethod, context: ClassMethodDecoratorContext | ClassDecoratorContext) {
        if (context.kind === 'class') {
            const testClass = testMethodOrClass as Class;
            const testMethods = Object.getOwnPropertyNames(testClass.prototype)
                .filter(method => typeof testClass.prototype[method] === 'function' &&
                    getMetadataFor(testClass.prototype[method])?.[Internal.hasTestDecorator]);

            for (const testMethod of testMethods) {
                const testMetadata = getMetadataFor(testClass.prototype[testMethod]);

                if (!testMetadata.customData.has(categoryKeyword)) {
                    testMetadata.customData.set(categoryKeyword, []);
                }

                if (!Array.isArray(testMetadata.customData.get(categoryKeyword))) {
                    throw new Error(`Custom metadata '${categoryKeyword}' MUST be array. Another plugin or decorator may have changed it.`);
                }

                const categoryArray = testMetadata.customData.get(categoryKeyword) as string[];
                categoryArray.push(name);
            }

            return;
        }

        if (context.kind === 'method') {
            const testMethod = testMethodOrClass as ClassMethod;
            const testMetadata = getMetadataFor(testMethod);

            if (!testMetadata.customData.has(categoryKeyword)) {
                testMetadata.customData.set(categoryKeyword, []);
            }

            if (!Array.isArray(testMetadata.customData.get(categoryKeyword))) {
                throw new Error(`Custom metadata '${categoryKeyword}' MUST be array. Another plugin or decorator may have changed it.`);
            }

            const categoryArray = testMetadata.customData.get(categoryKeyword) as string[];
            categoryArray.push(name);
            return;
        }
    };
}

export {
    Category,
    Category as category,
};
