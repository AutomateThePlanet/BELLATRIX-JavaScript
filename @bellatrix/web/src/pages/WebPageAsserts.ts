import { WebPageMap } from '.';

export abstract class WebPageAsserts<TMap extends WebPageMap> {
    get map(): TMap extends null ? never : TMap {
        throw Error('Type parameters may be lost during transpile time. Use the @Page decorator to explicitly define the map class for this page.');
    };
}