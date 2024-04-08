import { WebPageAsserts } from '@bellatrix/web/pages'
import { MainPageMap } from './MainPageMap';

export class MainPageAsserts extends WebPageAsserts<MainPageMap> {
    async productBoxLink(name: string, expectedLink: string) {
        await this.map.getProductBoxByName(name).validate('href').is(expectedLink);
    }
}