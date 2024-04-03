import { SuiteMetadata, TestMetadata } from "@bellatrix/core/test/props";

export abstract class Plugin {
    async preBeforeSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async postBeforeSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async beforeSuiteFailed(suiteMetadata: SuiteMetadata, beforeSuiteFailedReason: Error): Promise<void> {}
    async preBeforeTest(testMetadata: TestMetadata): Promise<void> {}
    async postBeforeTest(testMetadata: TestMetadata): Promise<void> {}
    async beforeTestFailed(testMetadata: TestMetadata, beforeTestFailedReason: Error): Promise<void> {}
    async preAfterTest(testMetadata: TestMetadata): Promise<void> {}
    async postAfterTest(testMetadata: TestMetadata): Promise<void> {}
    async afterTestFailed(testMetadata: TestMetadata, afterTestFailedReason: Error): Promise<void> {}
    async preAfterSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async postAfterSuite(suiteMetadata: SuiteMetadata): Promise<void> {}
    async afterSuiteFailed(suiteMetadata: SuiteMetadata, afterSuiteFailedReason: Error): Promise<void> {}
}