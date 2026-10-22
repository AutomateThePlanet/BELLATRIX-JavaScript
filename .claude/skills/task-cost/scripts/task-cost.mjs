#!/usr/bin/env node
// Calculates what a QA task cost in model tokens, per agent and per model, from Claude Code session
// transcripts (~/.claude/projects/<project>/<session>.jsonl and <session>/subagents/*.jsonl).
// Each API response is counted once (deduplicated by request id) and priced with ../pricing.json.
// Usage: node task-cost.mjs [--session=<id>] [--since=<ISO>] [--until=<ISO>] [--projects=<dir>] [--json]
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = name => args.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const asJson = args.includes('--json');
const since = opt('since') ? Date.parse(opt('since')) : -Infinity;
const until = opt('until') ? Date.parse(opt('until')) : Infinity;

const pricing = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'pricing.json'), 'utf8'));

// Claude Code stores a project's sessions under its path with every non-alphanumeric character replaced by '-'.
const projectDir = opt('projects') ?? join(homedir(), '.claude', 'projects', resolve('.').replace(/[^a-zA-Z0-9]/g, '-'));
if (!existsSync(projectDir)) {
    console.error(`No Claude Code sessions at ${projectDir}. Run from the repo root or pass --projects=<dir>.`);
    process.exit(2);
}

// Default to the most recently written session: the one the coordinator is running in.
const sessionId = opt('session') ?? readdirSync(projectDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ id: f.slice(0, -'.jsonl'.length), mtime: statSync(join(projectDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.id;
const mainFile = join(projectDir, `${sessionId}.jsonl`);
if (!sessionId || !existsSync(mainFile)) {
    console.error(`Session ${sessionId ?? '(none)'} not found in ${projectDir}.`);
    process.exit(2);
}
const subDir = join(projectDir, sessionId, 'subagents');
const files = [mainFile, ...(existsSync(subDir) ? readdirSync(subDir).filter(f => f.endsWith('.jsonl')).map(f => join(subDir, f)) : [])];

// Agent type of each subagent transcript, from its .meta.json; records also carry attributionAgent.
function agentTypeOf(file) {
    const meta = file.replace(/\.jsonl$/, '.meta.json');
    return existsSync(meta) ? JSON.parse(readFileSync(meta, 'utf8')).agentType : undefined;
}

function priceOf(model, u) {
    const p = pricing.models[model];
    if (!p) {
        return undefined;
    }
    const promptTokens = u.input + u.cacheWrite5m + u.cacheWrite1h + u.cacheRead;
    const rate = p.longContext && promptTokens > p.longContext.aboveInputTokens ? p.longContext : p;
    return (u.input * rate.input + u.output * rate.output + u.cacheWrite5m * rate.cacheWrite5m
        + u.cacheWrite1h * rate.cacheWrite1h + u.cacheRead * rate.cacheRead) / 1e6;
}

const seen = new Set();
const rows = new Map(); // `${agent}|${model}` -> totals
const unpriced = new Set();
let first = Infinity;
let last = -Infinity;

for (const file of files) {
    const fileAgent = file === mainFile ? 'qa-coordinator (main session)' : agentTypeOf(file);
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.includes('"assistant"')) {
            continue;
        }
        let rec;
        try {
            rec = JSON.parse(line);
        } catch {
            continue;
        }
        const usage = rec.message?.usage;
        const ts = Date.parse(rec.timestamp);
        if (rec.type !== 'assistant' || !usage || ts < since || ts > until) {
            continue;
        }
        // One response is written as several records (one per content block) that repeat the same usage.
        const key = rec.requestId ?? rec.message.id;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        first = Math.min(first, ts);
        last = Math.max(last, ts);

        const agent = rec.attributionAgent ?? fileAgent ?? 'unknown';
        const model = rec.message.model;
        const u = {
            input: usage.input_tokens ?? 0,
            output: usage.output_tokens ?? 0,
            cacheWrite5m: usage.cache_creation?.ephemeral_5m_input_tokens ?? 0,
            cacheWrite1h: usage.cache_creation?.ephemeral_1h_input_tokens ?? 0,
            cacheRead: usage.cache_read_input_tokens ?? 0,
        };
        // Older transcripts have no 5m/1h split: treat all cache writes as 5-minute entries.
        if (!usage.cache_creation) {
            u.cacheWrite5m = usage.cache_creation_input_tokens ?? 0;
        }
        const cost = priceOf(model, u);
        if (cost === undefined) {
            unpriced.add(model);
        }

        const id = `${agent}|${model}`;
        const row = rows.get(id) ?? { agent, model, requests: 0, input: 0, cacheWrite5m: 0, cacheWrite1h: 0, cacheRead: 0, output: 0, cost: 0 };
        row.requests++;
        for (const k of Object.keys(u)) {
            row[k] += u[k];
        }
        row.cost += cost ?? 0;
        rows.set(id, row);
    }
}

const agents = [...rows.values()].sort((a, b) => b.cost - a.cost);
const byModel = Object.values(agents.reduce((acc, r) => {
    const m = acc[r.model] ??= { model: r.model, requests: 0, input: 0, cacheWrite5m: 0, cacheWrite1h: 0, cacheRead: 0, output: 0, cost: 0 };
    for (const k of ['requests', 'input', 'cacheWrite5m', 'cacheWrite1h', 'cacheRead', 'output', 'cost']) {
        m[k] += r[k];
    }
    return acc;
}, {})).sort((a, b) => b.cost - a.cost);
const total = byModel.reduce((s, m) => s + m.cost, 0);

if (asJson) {
    console.log(JSON.stringify({ sessionId, window: { from: new Date(first).toISOString(), to: new Date(last).toISOString() }, pricingAsOf: pricing.asOf, agents, byModel, total, unpriced: [...unpriced] }, null, 2));
    process.exit(0);
}

const k = n => n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);
const usd = n => `$${n.toFixed(2)}`;
const pct = n => total ? `${Math.round(n / total * 100)}%` : '-';

console.log(`Cost: ${usd(total)} (API list-price equivalent, pricing as of ${pricing.asOf})`);
console.log(`Session ${sessionId}, ${new Date(first).toISOString()} to ${new Date(last).toISOString()}, ${seen.size} API requests\n`);
console.log('| Agent | Model | Requests | Input | Cache write | Cache read | Output | Cost | Share |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of agents) {
    console.log(`| ${r.agent} | ${r.model} | ${r.requests} | ${k(r.input)} | ${k(r.cacheWrite5m + r.cacheWrite1h)} | ${k(r.cacheRead)} | ${k(r.output)} | ${usd(r.cost)} | ${pct(r.cost)} |`);
}
console.log('\n| Model | Requests | Cost | Share |');
console.log('|---|---|---|---|');
for (const m of byModel) {
    console.log(`| ${m.model} | ${m.requests} | ${usd(m.cost)} | ${pct(m.cost)} |`);
}
if (unpriced.size) {
    console.log(`\nNot priced (add to pricing.json): ${[...unpriced].join(', ')}`);
}
