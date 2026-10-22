// Allure reporter for the BELLATRIX Playwright runner.
// The runner calls the Playwright CLI without a playwright.config, so reporter options
// can't be passed there; this wrapper takes the results directory from the runner instead.
import allurePlaywright from 'allure-playwright';

const AllureReporter = allurePlaywright.default ?? allurePlaywright;

export default class BellatrixAllureReporter extends AllureReporter {
    constructor(options = {}) {
        super({
            detail: true,
            suiteTitle: true,
            ...options,
            resultsDir: process.env.BELLATRIX_ALLURE_RESULTS_DIR ?? options.resultsDir ?? './allure-results',
        });
    }
}
