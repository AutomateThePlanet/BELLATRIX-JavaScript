import { describe, it } from 'mocha';
import assert from 'assert';

import { decodeHtml, isConstructor } from '@bellatrix/core/utilities';

describe('Utilities', () => {
    describe('isConstructor', () => {
        it('should return true for a valid constructor function', () => {
            assert.strictEqual(isConstructor(Date), true);
        });

        it('should return false for an invalid constructor function', () => {
            assert.strictEqual(isConstructor({}), false);
            assert.strictEqual(isConstructor(() => { }), false);
        });

        it('should return false for null and undefined inputs', () => {
            assert.strictEqual(isConstructor(null), false);
            assert.strictEqual(isConstructor(undefined), false);
        });

        it('should return false for primitive values', () => {
            assert.strictEqual(isConstructor(123), false);
            assert.strictEqual(isConstructor('test'), false);
            assert.strictEqual(isConstructor(true), false);
        });

        it('should return false for array and object inputs', () => {
            assert.strictEqual(isConstructor([]), false);
            assert.strictEqual(isConstructor({}), false);
        });

        it('should return false for a regular function', () => {
            assert.strictEqual(isConstructor(() => { }), false);
        });

        it('should return false for instances of custom classes', () => {
            class MyClass { }
            assert.strictEqual(isConstructor(new MyClass()), false);
        });
    });

    describe('decodeHtml', () => {
        it('decodes basic HTML entities', () => {
            const htmlInput = '&lt;div&gt;Hello, world!&lt;/div&gt;';
            const expectedOutput = '<div>Hello, world!</div>';
            assert.strictEqual(decodeHtml(htmlInput), expectedOutput);
        });

        it('decodes extended HTML entities', () => {
            const htmlInput = '&#65;&#66;&#67; &amp; &#x41;&#x42;&#x43;';
            const expectedOutput = 'ABC & ABC';
            assert.strictEqual(decodeHtml(htmlInput), expectedOutput);
        });

        it('decodes empty string', () => {
            const htmlInput = '';
            const expectedOutput = '';
            assert.strictEqual(decodeHtml(htmlInput), expectedOutput);
        });

        it('does not decode string with no HTML entities', () => {
            const htmlInput = 'This is a test string with no HTML entities.';
            const expectedOutput = 'This is a test string with no HTML entities.';
            assert.strictEqual(decodeHtml(htmlInput), expectedOutput);
        });
    });
});
