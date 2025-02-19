import { resolve } from '@bellatrix/core/utilities';
import { WebPageMap, WebPageAsserts } from '.';
import { App } from '@bellatrix/web/infrastructure';

export abstract class WebPage<TMap extends WebPageMap | null = null, TAsserts extends WebPageAsserts<TMap extends null ? WebPageMap : TMap> | null = null> {
    protected get url(): string {
        throw Error(`url is not set for ${this.constructor.name}. Override the url getter.`);
    };

    get map(): TMap extends null ? never : TMap {
        throw Error('Type parameters may be lost during transpile time. Use the @Page decorator to explicitly define the map class for this page.');
    };

    get asserts(): TAsserts extends null ? never : TAsserts {
        throw Error('Type parameters may be lost during transpile time. Use the @Page decorator to explicitly define the asserts class for this page.');
    };

    get app(): App {
        return resolve(App);
    }

    async open(): Promise<void> {
        await this.app.navigation.navigate(this.url);
        await this.waitForPageLoad();
    }

    protected async waitForPageLoad(): Promise<void> {
    }
}
