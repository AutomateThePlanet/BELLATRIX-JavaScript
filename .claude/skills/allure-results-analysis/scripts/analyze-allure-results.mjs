#!/usr/bin/env node
// Summarises an Allure results directory (allure-playwright output from the BELLATRIX runner)
// into a short text report for agents: totals, failures with the failing step and locator,
// failures grouped by shared cause, flaky tests (same historyId, mixed statuses) and slowest tests.
// Usage: node analyze-allure-results.mjs [example/allure-results] [--top=5] [--json]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const dir = resolve(args.find(a => !a.startsWith('--')) ?? 'example/allure-results');
const top = Number((args.find(a => a.startsWith('--top=')) ?? '--top=5').split('=')[1]);
const asJson = args.includes('--json');

if (!existsSync(dir)) {
    console.error(`No Allure results at ${dir}. Is allureSettings.isEnabled true in bellatrix.config.ts, and did the run start?`);
    process.exit(2);
}

// eslint-disable-next-line no-control-regex
const clean = s => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').trim();
const label = (r, name) => (r.labels ?? []).filter(l => l.name === name).map(l => l.value);
const isProblem = s => s === 'failed' || s === 'broken';

// The deepest failed/broken step is where the test actually stopped.
function failingStepPath(steps, path = []) {
    for (const step of steps ?? []) {
        if (isProblem(step.status)) {
            const deeper = failingStepPath(step.steps, [...path, step.name]);
            return deeper ?? [...path, step.name];
        }
    }
    return null;
}

// Pull a locator out of a Playwright step name such as "locator.waitFor(xpath=//h2[...] >> nth=0)".
function locatorOf(stepName) {
    const m = String(stepName ?? '').match(/^locator\.\w+\((.*?)(?: >> nth=\d+)?\)$/);
    return m ? m[1] : null;
}

// Normalise volatile parts so the same cause in different tests groups together.
const signature = message => clean(message)
    .split(/ at |Call log:/)[0]
    .replace(/"[^"]*"|'[^']*'/g, '"…"')
    .replace(/\d+(\.\d+)?/g, 'N')
    .slice(0, 160);

const results = readdirSync(dir)
    .filter(f => f.endsWith('-result.json'))
    .map(f => JSON.parse(readFileSync(join(dir, f), 'utf-8')));

if (results.length === 0) {
    console.error(`No *-result.json files in ${dir}.`);
    process.exit(2);
}

// With retries, Allure writes one result per attempt; the latest attempt is the outcome.
const byHistory = new Map();
for (const r of results) {
    const key = r.historyId ?? r.uuid;
    if (!byHistory.has(key)) {
        byHistory.set(key, []);
    }
    byHistory.get(key).push(r);
}

const tests = [...byHistory.values()].map(attempts => {
    attempts.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    const last = attempts.at(-1);
    const statuses = attempts.map(a => a.status);
    const step = failingStepPath(last.steps);
    return {
        name: last.name,
        suite: [...label(last, 'suite'), ...label(last, 'subSuite')].join(' > '),
        tags: label(last, 'tag'),
        status: last.status,
        flaky: attempts.length > 1 && new Set(statuses).size > 1,
        attempts: statuses,
        durationMs: (last.stop ?? 0) - (last.start ?? 0),
        message: clean(last.statusDetails?.message),
        failingStep: step ? step.join(' > ') : null,
        locator: step ? locatorOf(step.at(-1)) : null,
        attachments: (last.attachments ?? []).filter(a => a.type !== 'text/plain').map(a => join(dir, a.source)),
    };
});

const counts = tests.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), {});
const problems = tests.filter(t => isProblem(t.status));
const groups = new Map();
for (const t of problems) {
    // In BELLATRIX many different causes surface as the same Playwright timeout message,
    // so the step where the test stopped is part of the cause.
    const key = `${signature(t.message) || '(no message)'} @ ${t.locator ?? t.failingStep ?? 'test body'}`;
    if (!groups.has(key)) {
        groups.set(key, []);
    }
    groups.get(key).push(t.name);
}
const flaky = tests.filter(t => t.flaky);
const slowest = [...tests].filter(t => t.status !== 'skipped').sort((a, b) => b.durationMs - a.durationMs).slice(0, top);

if (asJson) {
    console.log(JSON.stringify({ dir, counts, problems, groups: Object.fromEntries(groups), flaky, slowest }, null, 2));
    process.exit(problems.length ? 1 : 0);
}

const total = tests.length;
const order = ['passed', 'failed', 'broken', 'skipped', 'unknown'];
console.log(`Allure results: ${dir}`);
console.log(`Result: ${counts.passed ?? 0}/${total} passed, ${order.slice(1).map(s => `${counts[s] ?? 0} ${s}`).join(', ')}${flaky.length ? `, ${flaky.length} flaky` : ''}`);

if (problems.length) {
    console.log('\nProblems (failed = error in the test: validation mismatch, element not found, ...; broken = test-level timeout or infrastructure):');
    for (const t of problems) {
        console.log(`- [${t.status.toUpperCase()}] ${t.suite} > ${t.name}${t.tags.length ? ` (${t.tags.join(', ')})` : ''}`);
        console.log(`    message: ${t.message.slice(0, 300) || '(none)'}`);
        if (t.failingStep) {
            console.log(`    failed at: ${t.failingStep}`);
        }
        if (t.locator) {
            console.log(`    locator: ${t.locator}`);
        }
        if (t.attachments.length) {
            console.log(`    attachments: ${t.attachments.join(', ')}`);
        }
    }
}

const shared = [...groups.entries()].filter(([, names]) => names.length > 1);
if (shared.length) {
    console.log('\nShared causes (same normalised message):');
    for (const [sig, names] of shared) {
        console.log(`- ${names.length} tests: ${sig}\n    ${names.join(', ')}`);
    }
}

if (flaky.length) {
    console.log('\nFlaky (status changed between attempts):');
    for (const t of flaky) {
        console.log(`- ${t.suite} > ${t.name}: ${t.attempts.join(' -> ')}`);
    }
}

console.log(`\nSlowest ${slowest.length}:`);
for (const t of slowest) {
    console.log(`- ${(t.durationMs / 1000).toFixed(1)}s ${t.suite} > ${t.name}`);
}

process.exit(problems.length ? 1 : 0);
