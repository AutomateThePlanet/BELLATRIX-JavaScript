import { AbstractCtor } from '.';

export type ServiceRegistration<T> = {
    services: T[];
    isSingleton: boolean;
}

export type TypeRegistration<T> = {
    types: AbstractCtor<T>[];
}
