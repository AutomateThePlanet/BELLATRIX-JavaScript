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

export type MethodNames<T> = { // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type MethodNamesStartingWith<T, Prefix extends string> = { // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T as T[K] extends (...args: any[]) => any ? (K extends `${Prefix}${infer S}` ? S : never) : never]: K;
};

export type MethodsNamesWithArguments<T> = { // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends () => any ? never : T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Method<T, K extends keyof T> = T[K] extends (...args: any[]) => any ? T[K] : never;
export type StaticMethod<T> = T extends (...args: infer Params) => infer Return ? (...args: Params) => Return : never;
