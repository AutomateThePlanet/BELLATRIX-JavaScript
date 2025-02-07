import { SuiteMetadata, TestMetadata } from '@bellatrix/core/types';

export abstract class Plugin {
    async preBeforeSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async postBeforeSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async onBeforeSuiteError(suiteMetadata: SuiteMetadata, beforeSuiteFailedReason: Error): Promise<void> {}
    async preBeforeTest(testMetadata: TestMetadata): Promise<void> {}
    async postBeforeTest(testMetadata: TestMetadata): Promise<void> {}
    async onBeforeTesstError(testMetadata: TestMetadata, beforeTestFailedReason: Error): Promise<void> {}
    async preAfterTest(testMetadata: TestMetadata): Promise<void> {}
    async postAfterTest(testMetadata: TestMetadata): Promise<void> {}
    async onAfterTestError(testMetadata: TestMetadata, afterTestFailedReason: Error): Promise<void> {}
    async preAfterSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async postAfterSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async onAfterSuiteError(suiteMetadata: SuiteMetadata, afterSuiteFailedReason: Error): Promise<void> {}
}
