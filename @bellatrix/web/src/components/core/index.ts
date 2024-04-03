// import type { Ctor } from '@bellatrix/core/types';
// import { WebComponent, Button, TextField } from '..';

export * from './ComponentsList';
export * from './WebComponent';

// type ExtractAsyncMethods<T> = {
//     [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? K : never;
// }[keyof T];

// type AsyncHook<T extends WebComponent, Prefix extends string> = {
//     [K in ExtractAsyncMethods<T>]: K extends ExtractAsyncMethods<T>
//       ? `${Prefix}${Capitalize<K & string>}`
//       : never;
// }[ExtractAsyncMethods<T>];

// type BeforeHook<T extends WebComponent> = AsyncHook<T, 'before'>;
// type AfterHook<T extends WebComponent> = AsyncHook<T, 'after'>;

// function addListener<T extends WebComponent>(component: Ctor<T>, method: BeforeHook<T> | AfterHook<T>) {
//     // impl
// }

// addListener(Button, '')