import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Method, Result } from '@bellatrix/core/types';
import { DecoratorUtilities } from '@bellatrix/core/utilities';

function Debug<
    This extends BellatrixTest = BellatrixTest,
    Args extends unknown[] = unknown[],
    ClassMethod extends (this: This, ...args: Args) => void = (this: This, ...args: Args) => Result<void>
>(target: ClassMethod, _context: ClassMethodDecoratorContext<This, ClassMethod>): void {
    const testMetadata = DecoratorUtilities.getMetadata(target as () => Result<void>);
    testMetadata.only = true;
}

export {
    Debug,
    Debug as debug,
};
