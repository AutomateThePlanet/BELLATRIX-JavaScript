#!/usr/bin/env node

console.log('DEBUG: starting bellatrix'); // DEBUG

const nodeVersion = process.versions.node.split('.');
if (parseInt(nodeVersion[0].replace()) < 20 || (parseInt(nodeVersion[0]) === 20 && parseInt(nodeVersion[1]) < 9)) {
    throw Error(`You need Node runtime version 20.9.0 minimum. Current version: ${process.versions.node}`);
}

import { fork } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { pathToFileURL } from 'url';
import { tmpdir } from 'os';
import ts from 'typescript';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argvArray = hideBin(process.argv);

const Keywords = Object.freeze({
    Filter: 'filter',
});

const filterIndex = argvArray.lastIndexOf(Keywords.Filter);
let filterArgs = {};
if (filterIndex !== -1) {
    filterArgs = yargs(argvArray.slice(filterIndex + 1)).argv;
    if (filterArgs._[0]){
        const nextArgIndex = argvArray.indexOf(filterArgs._[0]);
        filterArgs = yargs(argvArray.slice(filterIndex + 1, nextArgIndex)).argv;
    }

    const cliFilters = Object.entries(filterArgs)
        .filter(([key]) => key !== '_' && key !== '$0') // Ignore positional args and script name
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    process.env.BELLATRIX_TEST_FILTER = JSON.stringify(cliFilters);
}

const argv = yargs(argvArray).argv;
const testsDirectory = argv._.find(arg => !Object.values(Keywords).includes(arg)) ?? '.';

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

const configFileURI = pathToFileURL(findFilePath(configs));
const debugPort = 12016;

let config;

if (configFileURI.href.endsWith('.ts') || configFileURI.href.endsWith('.mts')) {
    const configImport = await getTypescriptConfig(configFileURI);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFileURI.href.endsWith('.js') || configFileURI.href.endsWith('.mjs') || configFileURI.href.endsWith('.cjs')) {
    const configImport = await import(configFileURI);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFileURI.href.endsWith('.json')) {
    config = readJsonConfigFile(configFileURI);
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
    ? isAbsolute(reportDirectory) ? reportDirectory : join(dirname(configFileURI.pathname), reportDirectory)
    : null;

switch (config.frameworkSettings.testSettings.testFramework) {
    case 'vitest': {
        const { createVitest } = await import('vitest/node');

        const config = {
            include: [ join(testsDirectory, '**/*.test.ts') ],
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

        const cliArgs = [ 'test', testsDirectory ];

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
            case 'tap': throw new Error('Playwright does not have tap reporter implemented');
        }

        // cliArgs.push('--ui'); // TODO: make it an option

        const execArgv = [];
        const inspector = await import('inspector');

        if (inspector.url() !== undefined) {
            execArgv.push(`--inspect=${debugPort}`);
        }

        const child = fork(cliPath, cliArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: `--loader=${tsPathsEsmLoaderPath} --experimental-specifier-resolution=node --no-warnings`,
            },
            execArgv,
        });

        // Handle child process events (optional)
        child.on('exit', (code) => {
            console.log(`Child process exited with code ${code}`);
        });

        break;
    }
    default: {
        throw Error(`Test framework not implemented: ${config.frameworkSettings.testSettings.testFramework}`);
    }
}
