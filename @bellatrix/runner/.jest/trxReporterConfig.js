const trxReporterModulePath = new URL(import.meta.resolve('jest-trx-results-processor')).pathname;

/** @type {import('jest').Config} */
const config = {
    rootDir: process.env.JEST_TRX_ROOT_DIR,
    preset: process.env.JEST_TRX_PRESET_DIR,
    testMatch: [ process.env.JEST_TRX_TEST_MATCH ],
    reporters: [
        'default',
        [
            trxReporterModulePath,
            {
                outputFile: process.env.JEST_TRX_OUTPUT_NAME,
            }
        ],
    ],
};

export default config;
