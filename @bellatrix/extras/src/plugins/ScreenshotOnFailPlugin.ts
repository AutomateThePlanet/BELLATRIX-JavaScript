import { Plugin } from '@bellatrix/core/infrastructure';
import { TestMetadata } from '@bellatrix/core/test/props';
import { ServiceLocator } from '@bellatrix/core/utilities';
import { Image } from '@bellatrix/core/image';
import { App } from '@bellatrix/web/infrastructure';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, extname, join } from 'path';
import { BellatrixSettings } from '@bellatrix/core/settings';

export class ScreenshotOnFailPlugin extends Plugin {
    override async preAfterTest(metadata: TestMetadata): Promise<void> {
        const pluginSettings = BellatrixSettings.get().screenshotOnFailPluginSettings;

        if (!pluginSettings?.isPluginEnabled) {
            return;
        }

        if (!metadata.error) {
            return;
        }

        const app = ServiceLocator.resolve(App);
        const screenshotImage = await app.browser.getScreenshot();

        const outputPath = pluginSettings?.outputPath;

        if (!outputPath) {
            console.error('Output path for screenshots is not defined in the configuration.');
            return;
        }

        try {
            const projectRoot = process.env['BELLATRIX_CONFIGURAITON_ROOT']!; // TODO: find a better way to get the project root
            const pathArray = [projectRoot, outputPath];
            if (pluginSettings?.shouldCreateFolderPerSuite) {
                pathArray.push(metadata.suiteName);
            }
            pathArray.push(metadata.testName);
            const savePath = this.saveImageToFile(screenshotImage, join(...pathArray));
            console.info('\n Screenshot for failed test ' + metadata.testName + ': ' + savePath + '\n');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error saving screenshot:', error.message);
            } else {
                console.error('Error saving screenshot');
            }
        }
    }

    /**
     * Save an Image class instance as a file
     * @param image - The Image instance to be saved
     * @param outputPath - The path to save the image file
     */
    private saveImageToFile(image: Image, outputPath: string): string {
        const outputDir = dirname(outputPath);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = extname(outputPath) ? outputPath : `${outputPath}.${image.type}`;

        const binaryData = image.buffer;
        const arrayBufferView = new Uint8Array(binaryData.buffer, binaryData.byteOffset, binaryData.length);
        writeFileSync(outputFilePath, arrayBufferView);
        return outputFilePath;
    }
}

declare module '@bellatrix/core/types' {
    interface BellatrixConfiguration {
        screenshotOnFailPluginSettings?: ScreenshotOnFailPluginSettings;
    }
}

interface ScreenshotOnFailPluginSettings {
    isPluginEnabled: boolean;
    outputPath: string,
    shouldCreateFolderPerSuite?: boolean,
}
