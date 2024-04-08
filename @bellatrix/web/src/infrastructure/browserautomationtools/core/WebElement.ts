import { Locator } from '.';

import type { EvaluateFunction, HtmlAttribute } from '@bellatrix/web/types';

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
    abstract setInputFile(filePath: string): Promise<void>;
    
    abstract evaluate<R, VarArgs extends any[] = []>(script: string | EvaluateFunction<R, VarArgs>, ...args: VarArgs): Promise<R>;

    abstract findElement(locator: Locator): Promise<WebElement>;
    abstract findElements(locator: Locator): Promise<WebElement[]>;

    abstract selectByText(text: string): Promise<void>;
    abstract selectByIndex(index: number): Promise<void>;
    abstract selectByValue(value: string): Promise<void>;

    abstract isPresent(): Promise<boolean>;
    abstract isVisible(): Promise<boolean>;
    abstract isClickable(): Promise<boolean>;

    abstract scrollToVisible(): Promise<void>;
}