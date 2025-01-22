const nunitReporterModulePath = new URL(import.meta.resolve('jest-nunit-reporter')).pathname;

/** @type {import('jest').Config} */
const config = {
    rootDir: process.env.JEST_NUNIT_ROOT_DIR,
    preset: process.env.JEST_NUNIT_PRESET_DIR,
    testMatch: [ process.env.JEST_NUNIT_TEST_MATCH ],
    testResultsProcessor: nunitReporterModulePath,
    globalTeardown: import.meta.dirname + '/nunitTeardown.js', // may create problems (unlikely), but we can't import modules here
    reporters: [ 'default' ],
};

export default config;
