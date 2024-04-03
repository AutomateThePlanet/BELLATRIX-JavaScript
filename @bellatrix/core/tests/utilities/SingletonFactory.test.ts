import { describe, afterEach, it } from 'mocha';
import assert from 'assert';

import { SingletonFactory } from '@bellatrix/core/utilities';

describe('SingletonFactory', () => {
    class SomeClass { };

    afterEach(() => {
        SingletonFactory['instances'].clear();
    });

    describe('getInstance', () => {
        it('should return an instance of the provided class', () => {
            const instance = SingletonFactory.getInstance(SomeClass);
            assert(instance instanceof SomeClass, 'Returned instance is not an instance of the provided class');
        });
    });
});
