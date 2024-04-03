export interface NumberValidator {
    equals(expected: number): Promise<void>;
    notEqual(expected: number): Promise<void>;
    isLessThan(expected: number): Promise<void>;
    isGreaterThan(expected: number): Promise<void>;
    isLessThanOrEqual(expected: number): Promise<void>;
    isGreaterThanOrEqual(expected: number): Promise<void>;
}