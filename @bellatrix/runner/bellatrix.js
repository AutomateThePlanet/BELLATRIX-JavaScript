#!/usr/bin/env node

console.log('DEBUG: starting bellatrix'); // DEBUG

const nodeVersion = process.versions.node.split('.');
if (parseInt(nodeVersion[0].replace()) < 20 || (parseInt(nodeVersion[0]) == 20 && parseInt(nodeVersion[1]) < 6)) {
    throw Error(`You need Node runtime version 20.6.0 minimum. Current version: ${process.versions.node}`);
}

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, isAbsolute, relative } from 'path';
import { pathToFileURL } from 'url';
import { tmpdir } from 'os';
import ts from 'typescript';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const testsDirectory = argv._[0];

try {
    process.chdir(testsDirectory ?? '.');
} catch {
    throw Error(`No such directory: ${isAbsolute(testsDirectory) ? testsDirectory : join(process.cwd(), testsDirectory)}`);
}

async function getTypescriptConfig(filePath) {
    const fileContents = readFileSync(filePath instanceof URL ? filePath : new URL(filePath), 'utf-8');
    const { outputText } = ts.transpileModule(fileContents, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
    const tempJsFilePath = join(tmpdir(), `bellatrix.config.timestamp-${Date.now()}-${Math.random().toString(16).slice(2)}.js`);
    writeFileSync(tempJsFilePath, outputText, 'utf-8');
    const module = await import(pathToFileURL(tempJsFilePath).href);
    unlinkSync(tempJsFilePath); // Clean up temporary JavaScript file
    return module.default;
}

function findFilePath(fileVariants) { // use --config to point to config file
    let currentDir = process.cwd();
    let filePaths;
    while (true) {
        filePaths = fileVariants.map(fileVariant => join(currentDir, fileVariant));
        for (const filePath of filePaths) {
            if (existsSync(filePath)) {
                return filePath;
            }
        }

        const parentDir = dirname(currentDir);

        if (parentDir === currentDir) {
            return null;
        }

        currentDir = parentDir;
    }
}

function readJsonConfigFile(configFilePath) {
    const configFileContent = readFileSync(configFilePath, 'utf-8');
    const configObject = JSON.parse(configFileContent);
    return configObject;
}

const configs = [
    'bellatrix.config.ts',
    '.bellatrix.ts',
    'bellatrix.config.mts',
    '.bellatrix.mts',
    'bellatrix.config.js',
    '.bellatrix.js',
    'bellatrix.config.mjs',
    '.bellatrix.mjs',
    'bellatrix.config.cjs',
    '.bellatrix.cjs',
    'bellatrix.config.yaml',
    '.bellatrix.yaml',
    'bellatrix.config.yml',
    '.bellatrix.yml',
    'bellatrix.config.json',
    '.bellatrix.json',
];

const configFileURL = pathToFileURL(findFilePath(configs));
let config;

if (configFileURL.href.endsWith('.ts') || configFileURL.href.endsWith('.mts')) {
    const configImport = await getTypescriptConfig(configFileURL);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFileURL.href.endsWith('.js') || configFileURL.href.endsWith('.mjs') || configFileURL.href.endsWith('.cjs')) {
    const configImport = await import(configFileURL);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFileURL.href.endsWith('.json')) {
    config = readJsonConfigFile(configFileURL);
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

const reporter = config.frameworkSettings.testSettings.testReporter;

if (!reporter) {
    throw new Error(`Reporter not specified. Set testReporter to 'console-only' if you do not want to output a file report.`);
}

const supportedReporters = ['json', 'junit', 'trx', 'nunit', 'xunit', 'tap', 'console-only'];

if (!supportedReporters.includes(reporter)) {
    throw new Error(`Reporter '${reporter}' not supported.`);
}

const reportDirectory = config.frameworkSettings.testSettings.testReportDirectory;
const reportName = config.frameworkSettings.testSettings.testReportName;

if ((!reportDirectory || !reportName) && reporter !== 'console-only') {
    throw new Error(`Properties testReportDirectory and testReportName should be specified unless testReporter is 'console-only'.`);
}

const reportPath = reporter !== 'console-only'
    ? isAbsolute(reportDirectory) ? reportDirectory : join(dirname(configFileURL.pathname), reportDirectory)
    : null;

switch (config.frameworkSettings.testSettings.testFramework) {
    case 'vitest': {
        const { createVitest } = await import('vitest/node');

        const config = {
            include: [ '**/*.test.ts' ],
            config: false,
            watch: false,
            passWithNoTests: true,
            reporters: [ 'verbose' ],
        };

        switch (reporter) {
            case 'json': {
                config.reporters.push('json');
                config.outputFile = {
                    junit: '',
                    json: join(reportPath, reportName.endsWith('.json') ? reportName : `${reportName}.json`),
                };
                break;
            }
            case 'junit': {
                config.reporters.push('junit');
                config.outputFile = {
                    junit: join(reportPath, reportName.endsWith('.xml') ? reportName : `${reportName}.xml`),
                    json: '',
                };
                break;
            }
            case 'trx': throw new Error('Vitest does not have TRX reporter');
            case 'nunit': throw new Error('Vitest does not have NUnit reporter');
            case 'xunit': throw new Error('Vitest does not have xUnit reporter');
            case 'tap': {
                config.reporters.push('tap');
                config.outputFile = {
                    json: join(reportPath, reportName.endsWith('.tap') ? reportName : `${reportName}.tap`),
                };
                break;
            }
        }

        const vitest = await createVitest('test', config);

        await vitest.start();
        await vitest?.close();
        break;
    }
    case 'playwright': {
        const tsPathsEsmLoaderPath = new URL(import.meta.resolve('ts-paths-esm-loader')).pathname;
        const cliPath = findFilePath([ 'node_modules/playwright/cli.js' ]);

        const cliArgs = [ cliPath, 'test' ];

        switch (reporter) {
            case 'json': {
                cliArgs.push('--reporter=json');
                process.env.PLAYWRIGHT_JSON_OUTPUT_NAME = join(reportPath, reportName.endsWith('.json') ? reportName : `${reportName}.json`);
                break;
            }
            case 'junit': {
                cliArgs.push('--reporter=junit');
                process.env.PLAYWRIGHT_JUNIT_OUTPUT_NAME = join(reportPath, reportName.endsWith('.xml') ? reportName : `${reportName}.xml`);
                break;
            }
            case 'trx': {
                process.env.PLAYWRIGHT_TRX_OUTPUT_NAME = join(reportPath, reportName.endsWith('.trx') ? reportName : `${reportName}.trx`);
                const trxReporter = new URL(import.meta.resolve('./playwright/trxReporter.js')).pathname;
                cliArgs.push(`--reporter=${trxReporter}`);
                break;
            }
            case 'nunit': throw new Error('Playwright does not have NUnit reporter');
            case 'xunit': throw new Error('Playwright does not have xUnit reporter');
        }

        // cliArgs.push('--ui'); // TODO: make it an option

        spawnSync('node', cliArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: `--loader=${tsPathsEsmLoaderPath} --experimental-specifier-resolution=node --no-warnings`,
            }
        });

        break;
    }
    case 'jasmine': {
        const tsPathsEsmLoaderPath = new URL(import.meta.resolve('ts-paths-esm-loader')).pathname;
        const cliPath = findFilePath([ 'node_modules/jasmine/bin/jasmine.js' ]);
        const jasmineConfigPath = new URL(import.meta.resolve('./jasmine/config.json')).pathname;
        const cliArgs = [ cliPath, `--config=${jasmineConfigPath}` ];

        switch (reporter) {
            case 'json': throw new Error('Jasmine does not have default JSON reporter');
            case 'junit': {
                process.env.JASMINE_JUNIT_OUTPUT_DIR = reportPath;
                process.env.JASMINE_JUNIT_OUTPUT_NAME = reportName;
                const junitReporter = new URL(import.meta.resolve('./jasmine/junitReporter.js')).pathname;
                cliArgs.push(`--helper=${junitReporter}`);
                break;
            }
            case 'trx': {
                process.env.JASMINE_TRX_OUTPUT_DIR = reportPath;
                process.env.JASMINE_TRX_OUTPUT_NAME = reportName.endsWith('.trx') ? reportName : `${reportName}.trx`;
                const trxReporter = new URL(import.meta.resolve('./jasmine/trxReporter.js')).pathname;
                cliArgs.push(`--helper=${trxReporter}`);
                break;
            }
            case 'nunit': {
                process.env.JASMINE_NUNIT_OUTPUT_DIR = reportPath;
                process.env.JASMINE_NUNIT_OUTPUT_NAME = reportName.endsWith('.xml') ? reportName : `${reportName}.xml`;
                const nunitReporter = new URL(import.meta.resolve('./jasmine/nunitReporter.js')).pathname;
                cliArgs.push(`--helper=${nunitReporter}`);
                break;
            }
            case 'xunit': throw new Error('Jasmine does not have xUnit reporter');
        }

        spawnSync('node', cliArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: `--loader=${tsPathsEsmLoaderPath} --experimental-specifier-resolution=node --no-warnings`,
            }
        });

        break;
    }
    case 'mocha': {
        const tsPathsEsmLoaderPath = new URL(import.meta.resolve('ts-paths-esm-loader')).pathname;
        const cliPath = findFilePath([ 'node_modules/mocha/bin/mocha.js' ]);
        const cliArgs = [ cliPath, '**/*.test.?(m){ts,js}' ];

        switch (reporter) {
            case 'json': {
                const jsonReporter = new URL(import.meta.resolve('mocha-json-output-reporter')).pathname;
                cliArgs.push('--reporter', jsonReporter, '--reporter-options', `output=${join(reportPath, reportName.endsWith('.json') ? reportName : `${reportName}.json`)}`);
                break;
            }
            case 'junit': {
                const junitReporter = new URL(import.meta.resolve('mocha-junit-reporter')).pathname;
                cliArgs.push('--reporter', junitReporter, '--reporter-options', `mochaFile=${join(reportPath, reportName.endsWith('.xml') ? reportName : `${reportName}.xml`)}`);
                break;
            }
            case 'trx': {
                const trxReporter = new URL(import.meta.resolve('mocha-trx-reporter')).pathname;
                const outputFolderPath = relative(process.cwd(), reportPath);
                mkdirSync(outputFolderPath, { recursive: true });
                const outputFilePath = join(outputFolderPath, reportName.endsWith('.trx') ? reportName : `${reportName}.trx`);
                cliArgs.push('--reporter', trxReporter, '--reporter-options', `output=${outputFilePath}`);
                break;
            }
            case 'nunit': throw new Error('Mocha does not have NUnit reporter');
            case 'xunit': {
                const xunitReporter = new URL(import.meta.resolve('mocha-xunit-reporter')).pathname;
                cliArgs.push('--reporter', xunitReporter, '--reporter-options', `mochaFile=${join(reportPath, reportName.endsWith('.xml') ? reportName : `${reportName}.xml`)}`);
                break;
            }
        }

        spawnSync('node', cliArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: `--loader=${tsPathsEsmLoaderPath} --experimental-specifier-resolution=node --no-warnings`,
            }
        });

        break;
    }
    case 'jest': {
        const defaultEsm = new URL(import.meta.resolve('ts-jest/presets/default-esm')).pathname;
        const tsPathsEsmLoaderPath = new URL(import.meta.resolve('ts-paths-esm-loader')).pathname;
        const cliPath = join(new URL(import.meta.resolve('jest-cli')).pathname, '..', '..', 'bin', 'jest.js');
        const testMatch = '\\.test\\.(ts|js)';
        const cliArgs = [ cliPath ];

        switch (reporter) {
            case 'json': throw new Error('Jest does not have default JSON reporter');
            case 'junit': {
                const junitReporter = new URL(import.meta.resolve('jest-junit')).pathname;
                process.env.JEST_JUNIT_OUTPUT_DIR = reportPath;
                process.env.JEST_JUNIT_OUTPUT_NAME = reportName.endsWith('.xml') ? reportName : `${reportName}.xml`;
                cliArgs.push(`--reporters=${junitReporter}`, `--preset=${defaultEsm}`, `${testMatch}$`);
                break;
            }
            case 'trx': {
                const trxReporterConfig = new URL(import.meta.resolve('./jest/trxReporterConfig.js')).pathname;
                process.env.JEST_TRX_PRESET_DIR = defaultEsm;
                process.env.JEST_TRX_TEST_MATCH = '**/*' + testMatch.replace(/\\/g, '');
                process.env.JEST_TRX_ROOT_DIR = process.cwd();
                process.env.JEST_TRX_OUTPUT_NAME = join(reportPath, reportName.endsWith('.trx') ? reportName : `${reportName}.trx`);
                cliArgs.push(`--config=${trxReporterConfig}`);
                break;
            }
            case 'nunit': {
                const nunitReporterConfig = new URL(import.meta.resolve('./jest/nunitReporterConfig.js')).pathname;
                process.env.JEST_NUNIT_PRESET_DIR = defaultEsm;
                process.env.JEST_NUNIT_TEST_MATCH = '**/*' + testMatch.replace(/\\/g, '');
                process.env.JEST_NUNIT_ROOT_DIR = process.cwd();
                process.env.JEST_NUNIT_OUTPUT_DIR = reportPath;
                process.env.JEST_NUNIT_OUTPUT_NAME = reportName.endsWith('.xml') ? reportName : `${reportName}.xml`;
                cliArgs.push(`--config=${nunitReporterConfig}`);
                break;
            }
            case 'xunit': {
                const xunitReporterConfig = new URL(import.meta.resolve('./jest/xunitReporterConfig.js')).pathname;
                process.env.JEST_XUNIT_PRESET_DIR = defaultEsm;
                process.env.JEST_XUNIT_TEST_MATCH = '**/*' + testMatch.replace(/\\/g, '');
                process.env.JEST_XUNIT_ROOT_DIR = process.cwd();
                process.env.JEST_XUNIT_OUTPUT_DIR = reportPath;
                process.env.JEST_XUNIT_OUTPUT_NAME = reportName.endsWith('.xml') ? reportName : `${reportName}.xml`;
                cliArgs.push(`--config=${xunitReporterConfig}`);
                break;
            }
            default: {
                cliArgs.push(`--preset=${defaultEsm}`, `${testMatch}$`);
            }
        }

        spawnSync('node', cliArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: `--loader=${tsPathsEsmLoaderPath} --experimental-vm-modules --no-warnings`,
            }
        });

        break;
    }
    default: {
        throw Error(`Test framework not implemented: ${config.frameworkSettings.testSettings.testFramework}`);
    }
}

// ### MOCHA ###
// node --loader=ts-paths-esm-loader --experimental-specifier-resolution=node --loader=ts-node/esm/transpile-only --no-warnings ../node_modules/mocha/bin/mocha.js **/*.test.ts // from tests folder bc local page

// import * as jest from 'jest-cli';

// jest.yargsOptions
// await jest.run(undefined, '.') // does not work but the line below does with external config

// node --loader=ts-paths-esm-loader --experimental-specifier-resolution=node --loader=ts-node/esm/transpile-only --experimental-vm-modules --no-warnings ../node_modules/jest-cli/bin/jest.js
