import { WebComponent } from "components";
import { BellatrixComponent } from "components/decorators";

@BellatrixComponent
export class Output extends WebComponent {
    async getFor(): Promise<string> {
        return await this.wrappedElement.getAttribute('for');
    }
    
    async getInnerHtml(): Promise<string> {
        return await this.wrappedElement.getInnerHtml();
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
}