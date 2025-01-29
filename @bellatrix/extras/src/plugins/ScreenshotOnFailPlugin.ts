import { Plugin } from '@bellatrix/core/infrastructure';
import { TestMetadata } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { App } from '@bellatrix/web/infrastructure';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotOnFailPlugin extends Plugin {
    override async preAfterTest(metadata: TestMetadata): Promise<void> {
        if(metadata.error !== undefined) {
            const app = ServiceLocator.resolve(App);
            const screenshotImage = await app.browser.getScreenshot();
            // Save the screenshot as an image file
            try {
                const savePath = this.saveImageFromBase64(screenshotImage.base64, '../reports/screenshots/' + metadata.testName); // TODO: take from config
                console.info('\n Screenshot for failed test ' + metadata.testName + ': ' + savePath + '\n');
            } catch (error) {
                console.error('Error saving screenshot:', (error as Error).message);
            }
        }
    }

    /**
     * Save a Base64 string as an image file
     * @param base64String - The Base64 string of the image
     * @param outputPath - The path to save the image file
     */
    private saveImageFromBase64(base64String: string, outputPath: string): string {
        // Check if the Base64 string contains the data prefix (e.g., "data:image/png;base64,")
        let matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            base64String = 'data:image/png;base64,' + base64String;
            matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        }
        // Extract the file extension and the Base64-encoded data
        const fileExtension = matches[1]; // e.g., 'png', 'jpeg', etc.
        const base64Data = matches[2];
        // Decode the Base64 string into binary data
        const binaryData = Buffer.from(base64Data, 'base64');
        const arrayBufferView: Uint8Array = new Uint8Array(binaryData.buffer, binaryData.byteOffset, binaryData.length);
        // Ensure the output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Determine the output file path (with the correct file extension)
        const outputFilePath = path.extname(outputPath)
            ? outputPath
            : `${outputPath}.${fileExtension}`;
        // Write the binary data to a file
        fs.writeFileSync(outputFilePath, arrayBufferView);
        return outputFilePath;
    }
}
