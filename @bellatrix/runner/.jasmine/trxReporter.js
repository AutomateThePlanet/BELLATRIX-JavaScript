import JasmineTrxReporter from 'jasmine-trx-reporter';

const reporter = new JasmineTrxReporter({
    folder: process.env.JASMINE_TRX_OUTPUT_DIR,
    outputFile: process.env.JASMINE_TRX_OUTPUT_NAME,
});

jasmine.getEnv().addReporter(reporter);
