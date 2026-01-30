import { BellatrixTest } from '@bellatrix/core/infrastructure';
import { Result } from '@bellatrix/core/types';
import { getMetadataFor } from '@bellatrix/core/utilities';
import { Internal } from '../test/_common';

function Only<
    ClassMethod extends (this: This, ...args: never) => void,
    This extends BellatrixTest = BellatrixTest,
>(target: ClassMethod, _context: ClassMethodDecoratorContext): void {
    const testMetadata = getMetadataFor(target as () => Result<void>);
    testMetadata[Internal.only] = true;
}

export {
    Only,
    Only as only,
};
