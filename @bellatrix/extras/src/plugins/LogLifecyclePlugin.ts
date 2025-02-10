import { Plugin } from '@bellatrix/core/infrastructure';

import type { TestMetadata } from '@bellatrix/core/types';

export class LogLifecyclePlugin extends Plugin {
    override async preBeforeTest(testMetadata: TestMetadata): Promise<void> {
        console.log('\n==================================================================================\n' +
            `starting test: ${testMetadata.suiteClass.name} > ${testMetadata.testMethod.name}\n`);
    }

    override async postAfterTest(_: TestMetadata): Promise<void> {
        console.log('\n==================================================================================\n');
    }
}
