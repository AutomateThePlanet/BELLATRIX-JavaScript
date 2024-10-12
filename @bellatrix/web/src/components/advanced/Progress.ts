import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class Progress extends WebComponent<HTMLProgressElement> {
    async getMax(): Promise<number> {
        return parseFloat(await this.getAttribute('max'));
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
    
    async getValue(): Promise<number> {
        return parseFloat(await this.getAttribute('value'));
    } 
}