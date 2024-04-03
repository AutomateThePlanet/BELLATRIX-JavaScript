export interface BooleanValidator {
    isTrue(expected: boolean): Promise<void>;
    isFalse(expected: boolean): Promise<void>;
}