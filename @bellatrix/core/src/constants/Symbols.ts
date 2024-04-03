const beforeAll = Symbol('bellatrix:beforeAll');
const beforeEach = Symbol('bellatrix:beforeEach');
const afterEach = Symbol('bellatrix:afterEach');
const afterAll = Symbol('bellatrix:afterAll');
const test = Symbol('bellatrix:test');
const suite = Symbol('bellatrix:suite');
const currentTest = Symbol('bellatrix:currentTest');

export const Symbols = {
    beforeAll,
    beforeEach,
    afterEach,
    afterAll,
    test,
    suite,
    currentTest,
} as const;