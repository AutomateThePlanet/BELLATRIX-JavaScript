import { NUnitXmlReporter } from 'jasmine-reporters';

const reporter = new NUnitXmlReporter({
    savePath: process.env.JASMINE_NUNIT_OUTPUT_DIR,
    filename: process.env.JASMINE_NUNIT_OUTPUT_NAME,
});

jasmine.getEnv().addReporter(reporter);
