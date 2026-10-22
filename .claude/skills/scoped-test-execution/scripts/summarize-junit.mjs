#!/usr/bin/env node
// Summarises a JUnit XML report (as written by the BELLATRIX runner) into a short,
// token-cheap text block: totals, then one line per failed/errored/skipped test.
// Usage: node summarize-junit.mjs [path/to/result.xml] [--max-message=300]
import { readFileSync, existsSync, statSync } from 'node:fs';

const args = process.argv.slice(2);
const reportPath = args.find(a => !a.startsWith('--')) ?? 'example/reports/result.xml';
const maxMessage = Number((args.find(a => a.startsWith('--max-message=')) ?? '--max-message=300').split('=')[1]);

if (!existsSync(reportPath)) {
    console.error(`No report at ${reportPath}. Did the run start? Is testReporter 'junit' in bellatrix.config.ts?`);
    process.exit(2);
}

const xml = readFileSync(reportPath, 'utf-8');

const decode = s => s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/&amp;/g, '&');
// Strip ANSI colour codes that Playwright puts in failure messages.
// eslint-disable-next-line no-control-regex
const clean = s => decode(s).replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => {
    const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
    return m ? decode(m[1]) : '';
};

const results = { passed: 0, failed: 0, skipped: 0 };
const problems = [];
let totalTime = 0;

for (const m of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const head = m[1];
    const body = m[2] ?? '';
    const name = attr(head, 'name');
    const suite = attr(head, 'classname');
    totalTime += Number(attr(head, 'time')) || 0;

    const failure = body.match(/<(failure|error)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/);
    if (failure) {
        results.failed++;
        // Playwright puts only the location in `message`; the assertion text is in the body.
        const message = clean(failure[3] || '') || clean(attr(failure[2], 'message'));
        problems.push(`FAIL  ${suite} > ${name}\n      ${message.slice(0, maxMessage)}${message.length > maxMessage ? '...' : ''}`);
    } else if (/<skipped\b/.test(body)) {
        results.skipped++;
        problems.push(`SKIP  ${suite} > ${name}`);
    } else {
        results.passed++;
    }
}

const total = results.passed + results.failed + results.skipped;
const generated = statSync(reportPath).mtime.toISOString();

console.log(`Report: ${reportPath} (written ${generated})`);
console.log(`Result: ${results.passed}/${total} passed, ${results.failed} failed, ${results.skipped} skipped, ${totalTime.toFixed(1)}s`);
if (problems.length) {
    console.log(problems.join('\n'));
}
if (total === 0) {
    console.log('No test cases in the report: check the path argument and the filter (a non-matching filter skips everything).');
}

process.exit(results.failed > 0 ? 1 : 0);
