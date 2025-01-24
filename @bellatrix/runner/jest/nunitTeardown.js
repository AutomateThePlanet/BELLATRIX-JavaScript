export default async () => {
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');
    process.chdir(os.tmpdir());
    fs.writeFileSync(path.join(os.tmpdir(), 'package.json'), /* json */ `{
        "jestNunitReporter": {
            "outputPath": "${process.env.JEST_NUNIT_OUTPUT_DIR}",
            "outputFilename": "${process.env.JEST_NUNIT_OUTPUT_NAME}"
        }
    }`, 'utf-8');
};
