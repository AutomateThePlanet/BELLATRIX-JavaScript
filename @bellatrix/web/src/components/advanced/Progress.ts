import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Progress extends WebComponent<HTMLProgressElement> {
    async getMax(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('max'));
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
    
    async getValue(): Promise<number> {
        return parseFloat(await this.wrappedElement.getAttribute('value'));
    } 
}