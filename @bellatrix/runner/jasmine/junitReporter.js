import { JUnitXmlReporter } from 'jasmine-reporters';

const reporter = new JUnitXmlReporter({
    savePath: process.env.JASMINE_JUNIT_OUTPUT_DIR,
    filePrefix: process.env.JASMINE_JUNIT_OUTPUT_NAME,
    consolidateAll: true,
});

jasmine.getEnv().addReporter(reporter);
