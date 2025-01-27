import { BellatrixWebComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixWebComponent
export class FileInput extends WebComponent<HTMLInputElement> {
    async upload(filePath: string): Promise<void> {
        await this.wrappedElement.setInputFile(filePath);
    }

    async isRequired(): Promise<boolean> {
        return (await this.getAttribute('required')).toLowerCase() === 'true';
    }

    async isMultiple(): Promise<boolean> {
        return (await this.getAttribute('multiple')).toLowerCase() === 'true';
    }

    async getAccept(): Promise<string> {
        return await this.getAttribute('accept');
    }
}
