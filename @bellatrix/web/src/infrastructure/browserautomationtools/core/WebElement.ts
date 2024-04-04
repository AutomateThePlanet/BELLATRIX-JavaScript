import type { HtmlAttribute } from '@bellatrix/web/types';
import { Locator } from '.';

export abstract class WebElement {
    abstract click(): Promise<void>;
    abstract hover(): Promise<void>;
    abstract setText(value: string): Promise<void>;
    abstract clear(): Promise<void>;
    abstract getAttribute(name: HtmlAttribute): Promise<string>;
    abstract getInnerText(): Promise<string>;
    abstract getInnerHtml(): Promise<string>;
    abstract isChecked(): Promise<boolean>;
    abstract setChecked(checked: boolean): Promise<void>;
    abstract setInputFile(file: string): Promise<void>;
    
    abstract evaluate<R>(script: string | Function, ...args: any[]): Promise<R>;

    abstract findElement(locator: Locator): Promise<WebElement>;
    abstract findElements(locator: Locator): Promise<WebElement[]>;

    abstract selectByText(text: string): Promise<void>;
    abstract selectByIndex(index: number): Promise<void>;
    abstract selectByValue(value: string): Promise<void>;
}