import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class FileInput extends WebComponent {
    async upload(file: string): Promise<void> {
        await this.wrappedElement.setInputFile(file);
    }
    
    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }

    async isMultiple(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('multiple')).toLowerCase() === 'true';
    }

    async getAccept(): Promise<string> {
        return await this.wrappedElement.getAttribute('accept');
    }
}
