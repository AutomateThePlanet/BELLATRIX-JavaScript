const BEFORE_ALL = Symbol('bellatrix:beforeAll');
const BEFORE_EACH = Symbol('bellatrix:beforeEach');
const AFTER_EACH = Symbol('bellatrix:afterEach');
const AFTER_ALL = Symbol('bellatrix:afterAll');
const TEST = Symbol('bellatrix:test');
const SUITE = Symbol('bellatrix:suite');
const CURRENT_TEST = Symbol('bellatrix:currentTest');

export const Symbols = {
    BEFORE_ALL,
    BEFORE_EACH,
    AFTER_EACH,
    AFTER_ALL,
    TEST,
    SUITE,
    CURRENT_TEST,
} as const;
