import { dirname, join } from 'path';

const trxReporterModulePath = join(dirname(new URL(import.meta.resolve('playwright-trx-reporter')).pathname), 'src', 'trxReporter.js');
const module = await import(trxReporterModulePath);

export default class extends module.TrxReporter {
    constructor() {
        super({
            outputFile: process.env.PLAYWRIGHT_TRX_OUTPUT_NAME,
        });
    }
}
