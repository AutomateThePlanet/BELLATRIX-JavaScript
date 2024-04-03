export interface StringValidator {
    is(expected: string): Promise<void>;
    isNot(expected: string): Promise<void>;
    contains(expected: string): Promise<void>;
}