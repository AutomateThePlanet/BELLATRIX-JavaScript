import { Plugin } from '@bellatrix/core/infrastructure';
import { TestMetadata } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { Image } from '@bellatrix/core/image';
import { App } from '@bellatrix/web/infrastructure';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotOnFailPlugin extends Plugin {
    override async preAfterTest(metadata: TestMetadata): Promise<void> {
        if (!metadata.error) {
            return;
        }

        const app = ServiceLocator.resolve(App);
        const screenshotImage = await app.browser.getScreenshot();
        // Save the screenshot as an image file
        try {
            const savePath = this.saveImageToFile(screenshotImage, '../reports/screenshots/' + metadata.testName); // TODO: take from config
            console.info('\n Screenshot for failed test ' + metadata.testName + ': ' + savePath + '\n');
        } catch (error) {
            console.error('Error saving screenshot:', (error as Error).message);
        }
    }

    /**
     * Save an Image class instance as a file
     * @param image - The Image instance to be saved
     * @param outputPath - The path to save the image file
     */
    private saveImageToFile(image: Image, outputPath: string): string {
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.extname(outputPath) ? outputPath : `${outputPath}.${image.type}`;

        const binaryData = image.buffer;
        const arrayBufferView: Uint8Array = new Uint8Array(binaryData.buffer, binaryData.byteOffset, binaryData.length);
        fs.writeFileSync(outputFilePath, arrayBufferView);
        return outputFilePath;
    }
}
