// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractCtor<T> = abstract new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Ctor<T, P extends any[] = any[]> = new (...args: P) => T;
export type ParameterlessCtor<T> = new () => T;
export type InstanceOrParameterlessCtor<T> = T | ParameterlessCtor<T>;
export type Result<T = unknown> = T | Promise<T>;
export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export type MethodNames<T> = {
    [K in keyof T]: T[K] extends (...args: infer _P) => infer _R ? K : never;
}[keyof T];

export type MethodNamesStartingWith<T, Prefix extends string> = {
    [K in keyof T as T[K] extends (...args: infer _P) => infer _R ? (K extends `${Prefix}${infer S}` ? S : never) : never]: K;
};

export type MethodsNamesWithArguments<T> = {
    [K in keyof T]: T[K] extends () => infer _R ? never : T[K] extends (...args: infer _P) => infer _R ? K : never;
}[keyof T];

export type Method<T, K extends keyof T = keyof T> = T[K] extends (this: T, ...args: infer _P) => infer _R ? T[K] : never;
export type StaticMethod<T> = T extends (...args: infer Params) => infer Return ? (...args: Params) => Return : never;
