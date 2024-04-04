import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Progress extends WebComponent {
    async getMax(): Promise<number> {
        return parseInt(await this.wrappedElement.getAttribute('max'));
    }

    async getInnerText(): Promise<string> {
        return await this.wrappedElement.getInnerText();
    }
    
    async getValue(): Promise<string> {
        return await this.wrappedElement.getAttribute('value');
    } 
}