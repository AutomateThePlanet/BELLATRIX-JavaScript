const xunitReporterModulePath = new URL(import.meta.resolve('jest-xunit')).pathname;

/** @type {import('jest').Config} */
const config = {
    rootDir: process.env.JEST_XUNIT_ROOT_DIR,
    preset: process.env.JEST_XUNIT_PRESET_DIR,
    testMatch: [ process.env.JEST_XUNIT_TEST_MATCH ],
    reporters: [
        'default',
        [
            xunitReporterModulePath,
            {
                filename: process.env.JEST_XUNIT_OUTPUT_NAME,
                outputPath: process.env.JEST_XUNIT_OUTPUT_DIR,
            }
        ],
    ],
};

export default config;
