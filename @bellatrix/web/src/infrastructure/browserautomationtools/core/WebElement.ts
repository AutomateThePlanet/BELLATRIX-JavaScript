import type { HtmlAttribute } from '@bellatrix/web/types';

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
}