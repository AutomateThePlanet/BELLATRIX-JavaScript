import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Result } from '@bellatrix/core/types';
import { DecoratorUtilities } from '@bellatrix/core/utilities';
import { BellatrixSymbol } from '../test/_common';

function Only<
    ClassMethod extends (this: This, ...args: never) => void,
    This extends BellatrixTest = BellatrixTest,
>(target: ClassMethod, _context: ClassMethodDecoratorContext): void {
    const testMetadata = DecoratorUtilities.getMetadata(target as () => Result<void>);
    testMetadata[BellatrixSymbol.only] = true;
}

export {
    Only,
    Only as only,
};
