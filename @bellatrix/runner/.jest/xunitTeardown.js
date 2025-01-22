export default async () => {
    const fs = await import('fs');
    fs.mkdirSync(process.env.JEST_XUNIT_OUTPUT_DIR, { recursive: true });
}
