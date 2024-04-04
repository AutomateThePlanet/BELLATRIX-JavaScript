#!/usr/bin/env node

console.log('DEBUG: starting bellatrix'); // DEBUG

const nodeVersion = process.versions.node.split('.');
if (parseInt(nodeVersion[0].replace()) < 20 || (parseInt(nodeVersion[0]) == 20 && parseInt(nodeVersion[1]) < 6)) {
    
    throw Error(`You need Node runtime version 20.6.0 minimum. Current version: ${process.versions.node}`)
}

import { spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { pathToFileURL } from 'url';
import { tmpdir } from 'os';
import ts from 'typescript';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const testsDirectory = argv._[0]

try {
    process.chdir(testsDirectory ?? '.');
} catch {
    throw Error(`No such directory: ${isAbsolute(testsDirectory) ? testsDirectory : join(process.cwd(), testsDirectory)}`)
}

async function getTypescriptConfig(filePath) {
    const fileContents = readFileSync(new URL(filePath), 'utf-8');
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
        filePaths = fileVariants.map(fileVariant => join(currentDir, fileVariant))
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
]

const configFile = pathToFileURL(findFilePath(configs)).href;
let config;

if (configFile.endsWith('.ts') || configFile.endsWith('.mts')) {
    const configImport = await getTypescriptConfig(configFile);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFile.endsWith('.js') || configFile.endsWith('.mjs') || configFile.endsWith('.cjs')) {
    const configImport = await import(configFile);
    config = configImport.default;
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

if (configFile.endsWith('.json')) {
    config = readJsonConfigFile(configFile);
    process.env.BELLATRIX_CONFIGURAITON = JSON.stringify(config);
}

switch (config.frameworkSettings.testSettings.testFramework) {
    case 'vitest': {
        const { createVitest } = await import('vitest/node');
        const vitest = await createVitest('test', { include: [ '**/*.test.ts' ], config: false, watch: false, passWithNoTests: true });
        await vitest.start();
        await vitest?.close();
        break;
    }
    case 'playwright': {
        const tsPathsEsmLoaderPath = new URL(import.meta.resolve('ts-paths-esm-loader')).pathname;
        const cliPath = findFilePath([ 'node_modules/playwright/cli.js' ]);

        spawnSync('node', [ cliPath, 'test', /* '--ui' TODO: make it an option */ ], {
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
        const jasmineConfigPath = new URL(import.meta.resolve('./.config/jasmine.json')).pathname;

        spawnSync('node', [ cliPath,`--config=${jasmineConfigPath}` ], {
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

        spawnSync('node', [ cliPath, '**/*.test.?(m){ts,js}' ], {
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
        //const cliPath = findFilePath([ 'node_modules/jest-cli/build/index.js' ]);

        spawnSync('node', [ cliPath, `--preset=${defaultEsm}`, '\\.test\\.(ts|js)$' ], {
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