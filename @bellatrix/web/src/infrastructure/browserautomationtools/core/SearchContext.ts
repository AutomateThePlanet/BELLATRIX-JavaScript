import { Locator, WebElement } from ".";

export interface SearchContext {
    findElement(locator: Locator): Promise<WebElement>;
    findElements(locator: Locator): Promise<WebElement[]>;
}