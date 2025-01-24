export type EqualityOptions = {
    strict: boolean;
}

export type ApproximateEqualityOptions = {
    method: 'round' | 'floor' | 'ceil'
}

export type AssertMultipleOptions = {
    message?: string,
    throwOnFirstError?: boolean;
    printStackOnFail?: boolean;
}

export type AssertExpression<T> = Function | ((actual: T) => void);

class BellatrixAggregateAssertionError extends Error {
    errors: Error[];
    constructor(errors: Error[], message?: string, printStackOnFail?: boolean) {
        const assertionFailedMessage = `There were ${errors.length} assertion error${errors.length > 1 ? 's' : ''}.${message !== undefined ? ` ${message}` : ''}\n`;
        super(assertionFailedMessage + errors.map(e => printStackOnFail === true ? e.stack : e.message).join('\n'));
        this.name = 'BellatrixAggregateAssertionError';
        this.errors = errors;
    }
}

class BellatrixAssertionError extends Error {
    constructor(expected?: string, actual?: string, message?: string, diffPointer?: number) {
        const assertionFailedMessage = 'Assertion Failed.';
        const expectedPrefix = 'Expected: ';
        const actualPrefix = 'But was: ';
        const indentation = 0;
        const arrowTailSymbol = '-';
        const tabReplacement = '    ';

        const padLength = Math.max(actualPrefix.length, expectedPrefix.length);

        let diffPointerLine: string | undefined;

        if (diffPointer !== undefined && actual !== undefined) {
            let arrowLength = indentation + padLength + diffPointer;
            const stringBeforeDifference = actual.slice(0, diffPointer).split('\n');
            if (stringBeforeDifference.length > 0 && diffPointer !== stringBeforeDifference[0].length) {
                arrowLength = stringBeforeDifference[stringBeforeDifference.length - 1].length;
            }

            const arrowExtension = (actual.match(new RegExp(/\t/, 'g')) || []).length * (tabReplacement.length - 1);

            diffPointerLine = `\n${arrowTailSymbol.repeat(arrowLength + arrowExtension)}^`;
        }
        message = message === undefined ? assertionFailedMessage : `${assertionFailedMessage} ${message}`;
        expected = expected?.replace(/\t/g, tabReplacement);
        actual = actual?.replace(/\t/g, tabReplacement);
        const expectedLine = expected === undefined ? '' : `\n${' '.repeat(indentation)}${expectedPrefix.padEnd(padLength)}${expected}`;
        const actualLine = actual === undefined ? '' : `\n${' '.repeat(indentation)}${actualPrefix.padEnd(padLength)}${actual}`;

        const errorMessage = message + expectedLine + actualLine + (diffPointerLine ?? '');
        super(errorMessage);
        this.name = 'BellatrixAssertionError';
    }
}

export class Assert {
    private constructor() {
        throw new Error('PluginExecutionEngine is static and cannot be instantiated');
    }

    static areEqual(expected: unknown, actual: unknown, message?: string): void
    static areEqual(expected: unknown, actual: unknown, options?: EqualityOptions, message?: string): void
    static areEqual(expected: unknown, actual: unknown, options?: EqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areEqual(expected, actual, undefined, options);
        }

        options ??= { strict: false };
        if (typeof expected === 'string' && typeof actual === 'string') {
            stringAssert(expected, actual, message);
        } else {
            const result = options.strict ? expected === actual : expected == actual;
            if (result === false) {
                throw new BellatrixAssertionError(quoteString(expected), quoteString(actual), message);
            }
        }
    }

    static areDeepEqual(expected: unknown, actual: unknown, message?: string): void
    static areDeepEqual(expected: unknown, actual: unknown, options?: EqualityOptions, message?: string): void
    static areDeepEqual(expected: unknown, actual: unknown, options?: EqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areDeepEqual(expected, actual, undefined, options);
        }

        options ??= { strict: false };
        const result = deepEquals(actual, expected, options?.strict);
        if (result === false) {
            throw new BellatrixAssertionError(typeof expected === 'object' ? JSON.stringify(expected) : String(expected), typeof actual === 'object' ? JSON.stringify(actual) : String(actual), message);
        }
    }

    static areApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, message?: string): void
    static areApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, options?: ApproximateEqualityOptions, message?: string): void
    static areApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, options?: ApproximateEqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areApproximatelyEqual(expected, actual, decimalPlaces, undefined, options);
        }

        options ??= { method: 'round' };
        const multiplier = Math.pow(10, decimalPlaces);
        const roundedNum1 = Math[options.method](expected * multiplier) / multiplier;
        const roundedNum2 = Math[options.method](actual * multiplier) / multiplier;
        const result = roundedNum1 === roundedNum2;
        if (result === false) {
            throw new BellatrixAssertionError('≈' + roundedNum1.toFixed(decimalPlaces), '≈' + roundedNum2.toFixed(decimalPlaces), message);
        }
    }

    static areNotEqual(expected: unknown, actual: unknown, message?: string): void
    static areNotEqual(expected: unknown, actual: unknown, options?: EqualityOptions, message?: string): void
    static areNotEqual(expected: unknown, actual: unknown, options?: EqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areNotEqual(expected, actual, undefined, options);
        }

        options ??= { strict: false };
        const result = options.strict ? expected !== actual : expected != actual;
        if (typeof expected === 'string' && typeof actual === 'string') {
            if (result === false) {
                throw new BellatrixAssertionError('not ' + quoteString(expected), undefined, message);
            }
        } else {
            if (result === false) {
                throw new BellatrixAssertionError('not ' + quoteString(expected), undefined, message);
            }
        }
    }

    static areNotDeepEqual(expected: unknown, actual: unknown, message?: string): void
    static areNotDeepEqual(expected: unknown, actual: unknown, options?: EqualityOptions, message?: string): void
    static areNotDeepEqual(expected: unknown, actual: unknown, options?: EqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areNotDeepEqual(expected, actual, undefined, options);
        }

        options ??= { strict: false };
        const result = !deepEquals(actual, expected, options?.strict);
        if (result === false) {
            throw new BellatrixAssertionError(typeof expected === 'object' ? 'not ' + JSON.stringify(expected) : 'not ' + String(expected), undefined, message);
        }
    }

    static areNotApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, message?: string): void
    static areNotApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, options?: ApproximateEqualityOptions, message?: string): void
    static areNotApproximatelyEqual(expected: number, actual: number, decimalPlaces: number, options?: ApproximateEqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.areNotApproximatelyEqual(expected, actual, decimalPlaces, undefined, options);
        }

        options ??= { method: 'round' };
        const multiplier = Math.pow(10, decimalPlaces);
        const roundedNum1 = Math[options.method](expected * multiplier) / multiplier;
        const roundedNum2 = Math[options.method](actual * multiplier) / multiplier;
        const result = roundedNum1 !== roundedNum2;
        if (result === false) {
            throw new BellatrixAssertionError('not ≈' + roundedNum1.toFixed(decimalPlaces), undefined, message);
        }
    }

    static isFalse(value: boolean, message?: string) {
        const result = value === false;
        if (result === false) {
            throw new BellatrixAssertionError('false', String(value), message);
        }
    }

    static isFalsy(value: unknown, message?: string) {
        const result = value == false;
        if (result === false) {
            throw new BellatrixAssertionError('falsy', quoteString(value), message);
        }
    }

    static isTrue(value: boolean, message?: string) {
        const result = value === true;
        if (result === false) {
            throw new BellatrixAssertionError('true', String(value), message);
        }
    }

    static isTruthy(value: unknown, message?: string) {
        const result = value == true;
        if (result === false) {
            throw new BellatrixAssertionError('truthy', quoteString(value), message);
        }
    }

    static isNaN(value: unknown, message?: string): void
    static isNaN(value: unknown, options?: EqualityOptions, message?: string): void
    static isNaN(value: unknown, options?: EqualityOptions | string, message?: string) {
        if (typeof options === 'string') {
            return this.isNaN(value, undefined, options);
        }

        options ??= { strict: false };
        const result = isNaN(value as number) && options.strict ? typeof value === 'number' : true;
        if (result === false) {
            throw new BellatrixAssertionError('NaN', quoteString(value), message);
        }
    }

    static isNull(value: unknown, message?: string) {
        const result = value === null;
        if (result === false) {
            throw new BellatrixAssertionError('null', quoteString(value), message);
        }
    }

    static isNotNull(value: unknown, message?: string) {
        const result = value !== null;
        if (result === false) {
            throw new BellatrixAssertionError('not null', undefined, message);
        }
    }

    static isDefined(value: unknown, message?: string) {
        const result = value !== undefined;
        if (result === false) {
            throw new BellatrixAssertionError('not undefined', undefined, message);
        }
    }

    static isUndefined(value: unknown, message?: string) {
        const result = value === undefined;
        if (result === false) {
            throw new BellatrixAssertionError('undefined', quoteString(value), message);
        }
    }

    static stringContains(substring: string, value: string, message?: string) {
        const result = value.includes(substring);
        if (result === false) {
            throw new BellatrixAssertionError(`contains ${substring}`, quoteString(value), message);
        }
    }

    static arrayIsEmpty(array: unknown[], message?: string) {
        const result = Array.isArray(array) && array.length === 0;
        if (result === false) {
            throw new BellatrixAssertionError('[]', quoteString(array), message);
        }
    }

    static arrayIsNotEmpty(array: unknown[], message?: string) {
        const result = Array.isArray(array) && array.length > 0;
        if (result === false) {
            throw new BellatrixAssertionError('[]', quoteString(array), message);
        }
    }

    static isInstanceOf(instanceOf: Function, value: unknown, message?: string) {
        const result = value instanceof instanceOf;
        if (result === false) {
            throw new BellatrixAssertionError(`instance of ${instanceOf.name}`, (value as object).constructor.name, message);
        }
    }

    static isNotInstanceOf(instanceOf: Function, value: unknown, message?: string) {
        const result = !(value instanceof instanceOf);
        if (result === false) {
            throw new BellatrixAssertionError(`not instance of ${instanceOf.name}`, value.constructor.name, message);
        }
    }

    static arrayIsSubsetOf(subsetOf: unknown[], array: unknown[], message?: string) {
        const result = array.every((item) => subsetOf.includes(item));

        const arraySet = new Set(array);
        const superset = new Set(subsetOf);

        const extra: unknown[] = [];

        arraySet.forEach((element) => {
            if (!superset.has(element)) {
                extra.push(element);
            }
        });

        if (result === false) {
            throw new BellatrixAssertionError(`subset of ${quoteString(subsetOf)}`, `          ${quoteString(array)}; extra elements: ${quoteString(extra)}`, message);
        }
    }

    static arrayIsNotSubsetOf(subsetOf: unknown[], array: unknown[], message?: string) {
        const result = array.every((item) => subsetOf.includes(item));

        if (result === false) {
            throw new BellatrixAssertionError(`not subset of ${quoteString(subsetOf)}`, quoteString(array), message);
        }
    }

    static arrayIsSupersetOf(supersetOf: unknown[], array: unknown[], message?: string) {
        const result = supersetOf.every((item) => array.includes(item));

        const arraySet = new Set(array);
        const subset = new Set(supersetOf);

        const missing: unknown[] = [];

        subset.forEach((element) => {
            if (!arraySet.has(element)) {
                missing.push(element);
            }
        });

        if (result === false) {
            throw new BellatrixAssertionError(`superset of ${quoteString(supersetOf)}`, `            ${quoteString(array)}; missing elements: ${quoteString(missing)}`, message);
        }
    }

    static arrayIsNotSupersetOf(supersetOf: unknown[], array: unknown[], message?: string) {
        const result = !supersetOf.every((item) => array.includes(item));

        if (result === false) {
            throw new BellatrixAssertionError(`not be superset of ${quoteString(supersetOf)}`, quoteString(array), message);
        }
    }

    static that<T>(value: T, ...expressions: AssertExpression<T>[]): void
    static that<T>(value: T, options: AssertMultipleOptions, ...expressions: AssertExpression<T>[]): void
    static that<T>(value: T, options?: AssertMultipleOptions | AssertExpression<T>, ...expressions: AssertExpression<T>[]) {
        if (typeof options !== 'object') {
            return this.that(value, {}, options!, ...expressions);
        }

        if (expressions[0] === undefined) {
            throw Error('Used assert.that without conditions to assert.');
        }

        const errors: Error[] = [];
        for (const expression of expressions) {
            try {
                expression(value);
            } catch (e) {
                if (options.throwOnFirstError) {
                    if (options.message !== undefined) throw Error(options.message, { cause: e });
                    else throw e;
                }

                errors.push(e instanceof Error ? e : new Error('Non-Error exception occurred', { cause: e }));
            }
        };

        if (errors.length > 1) {
            throw new BellatrixAggregateAssertionError([...errors], options.message, options.printStackOnFail);
        }

        if (errors.length === 1) {
            throw errors[0];
        }
    }

    static async multiple(...expressions: Function[]): Promise<void>
    static async multiple(options: AssertMultipleOptions, ...expressions: Function[]): Promise<void>
    static async multiple(options?: AssertMultipleOptions | Function, ...expressions: Function[]) {
        if (typeof options !== 'object') {
            return this.multiple({}, options!, ...expressions);
        }

        if (expressions[0] === undefined) {
            throw Error('Used assert.multiple without conditions to assert.');
        }

        const errors: Error[] = [];
        for (const expression of expressions) {
            try {
                await expression();
            } catch (e) {
                if (options.throwOnFirstError) {
                    if (options.message !== undefined) throw Error(options.message, { cause: e });
                    else throw e;
                }

                errors.push(e instanceof Error ? e : new Error('Non-Error exception occurred', { cause: e }));
            }
        };

        if (errors.length > 1) {
            throw new BellatrixAggregateAssertionError([...errors], options.message, options.printStackOnFail);
        }

        if (errors.length === 1) {
            throw errors[0];
        }
    }
};

export const is = {
    equalTo<T>(expected: T, options?: EqualityOptions): AssertExpression<T> {
        return (actual: T) => Assert.areEqual(expected, actual, options);
    },

    deepEqualTo<T>(expected: T, options?: EqualityOptions): AssertExpression<T> {
        return (actual: T) => Assert.areDeepEqual(expected, actual, options);
    },

    approximatelyEqualTo(expected: number, decimalPlaces: number, options?: ApproximateEqualityOptions): AssertExpression<number> {
        return (actual: number) => Assert.areApproximatelyEqual(expected, actual, decimalPlaces, options);
    },

    get false(): AssertExpression<boolean> {
        return (actual: unknown) => Assert.isFalse(actual as boolean);
    },

    get true(): AssertExpression<boolean> {
        return (actual: unknown) => Assert.isTrue(actual as boolean);
    },

    get falsy(): AssertExpression<unknown> {
        return (actual: unknown) => Assert.isFalsy(actual);
    },

    get truthy(): AssertExpression<unknown> {
        return (actual: unknown) => Assert.isTruthy(actual);
    },

    get null(): AssertExpression<unknown> {
        return (actual: unknown) => Assert.isNull(actual);
    },

    get defined(): AssertExpression<unknown> {
        return (actual: unknown) => Assert.isDefined(actual);
    },

    get undefined(): AssertExpression<unknown> {
        return (actual: unknown) => Assert.isUndefined(actual);
    },

    greaterThan(expected: number): AssertExpression<number> {
        return (actual: number) => {
            try {
                Assert.isTrue(actual > expected);
            } catch {
                throw new BellatrixAssertionError(`> ${expected}`, `  ${quoteString(actual)}`);
            }
        };
    },

    greaterThanOrEqualTo(expected: number): AssertExpression<number> {
        return (actual: number) => {
            try {
                Assert.isTrue(actual >= expected);
            } catch {
                throw new BellatrixAssertionError(`≥ ${expected}`, `  ${quoteString(actual)}`);
            }
        };
    },

    lessThan(expected: number): AssertExpression<number> {
        return (actual: number) => {
            try {
                Assert.isTrue(actual < expected);
            } catch {
                throw new BellatrixAssertionError(`< ${expected}`, `  ${quoteString(actual)}`);
            }
        };
    },

    lessThanOrEqualTo(expected: number): AssertExpression<number> {
        return (actual: number) => {
            try {
                Assert.isTrue(actual <= expected);
            } catch {
                throw new BellatrixAssertionError(`≤ ${expected}`, `  ${quoteString(actual)}`);
            }
        };
    },

    instanceOf(expected: Function): AssertExpression<number> {
        return (actual: unknown) => Assert.isInstanceOf(expected, actual);
    },

    get empty(): AssertExpression<unknown[]> {
        return (actual: unknown[]) => {
            if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.empty) is only applicable for arrays.');
            Assert.arrayIsEmpty(actual);
        };
    },

    subsetOf(array: unknown[]): AssertExpression<unknown[]> {
        return (actual: unknown) => {
            if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.subsetOf(array)) is only applicable for arrays.');
            Assert.arrayIsSubsetOf(array, actual);
        };
    },

    supersetOf(array: unknown[]): AssertExpression<unknown[]> {
        return (actual: unknown) => {
            if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.supersetOf(array)) is only applicable for arrays.');
            Assert.arrayIsSupersetOf(array, actual);
        };
    },

    not: {
        equalTo<T>(expected: T, options?: EqualityOptions): AssertExpression<T> {
            return (actual: unknown) => Assert.areNotEqual(expected, actual, options);
        },

        approximatelyEqualTo(expected: number, decimalPlaces: number, options?: ApproximateEqualityOptions): AssertExpression<number> {
            return (actual: number) => Assert.areApproximatelyEqual(expected, actual, decimalPlaces, options);
        },

        deepEqualTo<T>(expected: unknown, options?: EqualityOptions): AssertExpression<T> {
            return (actual: unknown) => Assert.areNotDeepEqual(expected, actual, options);
        },

        get false(): AssertExpression<boolean> {
            return (actual: unknown) => Assert.isTrue(actual as boolean);
        },

        get true(): AssertExpression<boolean> {
            return (actual: unknown) => Assert.isFalse(actual as boolean);
        },

        get falsy(): AssertExpression<unknown> {
            return (actual: unknown) => Assert.isTruthy(actual);
        },

        get truthy(): AssertExpression<unknown> {
            return (actual: unknown) => Assert.isFalsy(actual);
        },

        get null(): AssertExpression<unknown> {
            return (actual: unknown) => Assert.isNotNull(actual);
        },

        get defined(): AssertExpression<unknown> {
            return (actual: unknown) => Assert.isUndefined(actual);
        },

        get undefined(): AssertExpression<unknown> {
            return (actual: unknown) => Assert.isDefined(actual);
        },

        greaterThan(expected: number): AssertExpression<number> {
            return (actual: number) => Assert.isFalse(actual > expected);
        },

        greaterThanOrEqualTo(expected: number): AssertExpression<number> {
            return (actual: number) => Assert.isFalse(actual >= expected);
        },

        lessThan(expected: number): AssertExpression<number> {
            return (actual: number) => Assert.isFalse(actual < expected);
        },

        lessThanOrEqualTo(expected: number): AssertExpression<number> {
            return (actual: number) => Assert.isFalse(actual <= expected);
        },

        instanceOf(expected: Function): AssertExpression<Function> {
            return (actual: unknown) => Assert.isNotInstanceOf(expected, actual);
        },

        get empty(): AssertExpression<unknown[]> {
            return (actual: unknown[]) => {
                if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.not.empty) is only applicable for arrays.');
                Assert.arrayIsNotEmpty(actual);
            };
        },

        subsetOf(array: unknown[]): AssertExpression<unknown[]> {
            return (actual: unknown) => {
                if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.not.subsetOf(array)) is only applicable for arrays.');
                Assert.arrayIsNotSubsetOf(array, actual);
            };
        },

        supersetOf(array: unknown[]): AssertExpression<unknown[]> {
            return (actual: unknown) => {
                if (!Array.isArray(actual)) throw Error('Assertion method assert.that(value, is.not.supersetOf(array)) is only applicable for arrays.');
                Assert.arrayIsNotSupersetOf(array, actual);
            };
        },
    },
} as const;

function deepEquals(obj1: unknown, obj2: unknown, strict: boolean) {
    if (obj1 === obj2) return true;

    if (obj1 && obj2 && typeof obj1 == 'object' && typeof obj2 == 'object') {
        if (obj1.constructor !== obj2.constructor) return false;

        let length, i;
        if (Array.isArray(obj1)) {
            length = obj1.length;
            if (length != (obj2 as unknown[]).length) return false;
            for (i = length; i-- !== 0;)
                if (!deepEquals(obj1[i], (obj2 as unknown[])[i], strict)) return false;
            return true;
        }

        if ((obj1 instanceof Map) && (obj2 instanceof Map)) {
            if (obj1.size !== obj2.size) return false;
            for (i of obj1.entries())
                if (!obj2.has(i[0])) return false;
            for (i of obj1.entries())
                if (!deepEquals(i[1], obj2.get(i[0]), strict)) return false;
            return true;
        }

        if ((obj1 instanceof Set) && (obj2 instanceof Set)) {
            if (obj1.size !== obj2.size) return false;
            for (i of obj1.entries())
                if (!obj2.has(i[0])) return false;
            return true;
        }

        if (ArrayBuffer.isView(obj1) && ArrayBuffer.isView(obj2)) {
            // @ts-expect-error - TypeScript ArrayBufferView type does not have length property
            length = obj1.length;
            // @ts-expect-error - TypeScript ArrayBufferView type does not have length property
            if (length != obj2.length) return false;
            for (i = length; i-- !== 0;)
                if (strict)
                    // @ts-expect-error - TypeScript ArrayBufferView type does not have length property
                    if (obj1[i] !== obj2[i]) return false;
                    else return true;
                else
                    // @ts-expect-error - TypeScript ArrayBufferView type does not have length property
                    if (obj1[i] != obj2[i]) return false;
                    else return true;
            return true;
        }

        // @ts-expect-error - TypeScript incorrectly thinks obj1 and obj2 are not objects
        if (obj1.constructor === RegExp) return obj1.source === obj2.source && obj1.flags === obj2.flags;
        if (obj1.valueOf !== Object.prototype.valueOf)
            if (strict) return obj1.valueOf() === obj2.valueOf();
            else return obj1.valueOf() == obj2.valueOf();
        if (obj1.toString !== Object.prototype.toString) return obj1.toString() === obj2.toString();

        const keys = Object.keys(obj1);
        length = keys.length;
        if (length !== Object.keys(obj2).length) return false;

        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(obj2, keys[i])) return false;

        for (i = length; i-- !== 0;) {
            const key = keys[i];

            if (!deepEquals(obj1[key as keyof typeof obj1], obj2[key as keyof typeof obj2], strict)) return false;
        }

        return true;
    }

    return obj1 !== obj1 && obj2 !== obj2;
}

function stringAssert(expected: string, actual: string, message?: string): void {
    if (expected !== actual) {
        const minLength = Math.min(expected.length, actual.length);
        let diffIndex = -1;
        for (let i = 0; i < minLength; i++) {
            if (expected[i] !== actual[i]) {
                diffIndex = i;
                break;
            }
        }

        throw new BellatrixAssertionError(`"${expected}"`, `"${actual}"`, `${message}\nStrings differ at index ${diffIndex}.`, diffIndex + 1);
    }
}

function quoteString(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(v => quoteString(v)).join(', ')}]`;
    return typeof value === 'string' ? `"${value}"` : `${value}`;
}

// make unit test that tests if 'NOT' has all the properties of 'is' except 'NOT'
