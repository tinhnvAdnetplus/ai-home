import { generatePlansSafe } from '../src/index.js';
import { generateAllAnswerSets } from './sweep-generator.js';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function canonicalStringify(val: unknown): string {
    if (val === null || typeof val !== 'object') {
        return JSON.stringify(val);
    }
    if (Array.isArray(val)) {
        return '[' + val.map(canonicalStringify).join(',') + ']';
    }
    const record = val as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return (
        '{' +
        keys
            .map((k) => JSON.stringify(k) + ':' + canonicalStringify(record[k]))
            .join(',') +
        '}'
    );
}

function sha256(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

function runSnapshot(): void {
    const sets = generateAllAnswerSets();
    const caseMap: Record<string, string> = {};

    for (const s of sets) {
        const res = generatePlansSafe(s.answers, undefined, undefined, 42);
        if (!res.ok) {
            const errCanonical = canonicalStringify({
                ok: false,
                issues: res.issues,
            });
            caseMap[`${s.name}#error`] = sha256(errCanonical);
            continue;
        }

        for (const plan of res.data.plans) {
            const planPayload = {
                model: plan.model,
                score: plan.score,
                warnings: plan.warnings,
                summary: plan.summary,
            };
            const planCanonical = canonicalStringify(planPayload);
            const planHash = sha256(planCanonical);
            caseMap[`${s.name}#${plan.id}`] = planHash;
        }
    }

    const sortedKeys = Object.keys(caseMap).sort();
    const combinedContent = sortedKeys
        .map((k) => `${k}:${caseMap[k]}`)
        .join('\n');
    const combinedHash = sha256(combinedContent);

    const snapshotFile = resolve(__dirname, '.snapshot-before.json');
    const shouldUpdate =
        process.env.UPDATE_SNAPSHOT === '1' || !existsSync(snapshotFile);

    if (shouldUpdate) {
        const payload = {
            combinedHash,
            totalCases: sortedKeys.length,
            cases: caseMap,
            ...caseMap,
        };
        writeFileSync(
            snapshotFile,
            JSON.stringify(payload, null, 2) + '\n',
            'utf-8',
        );
        console.log(
            `Created baseline snapshot: ${sortedKeys.length.toString()} plans recorded.`,
        );
        console.log(`Combined hash: ${combinedHash}`);
        console.log(`Saved to: ${snapshotFile}`);
        return;
    }

    const baselineRaw = JSON.parse(readFileSync(snapshotFile, 'utf-8')) as {
        combinedHash?: string;
        cases?: Record<string, string>;
    } & Record<string, string>;

    const baselineCases: Record<string, string> =
        baselineRaw.cases ?? baselineRaw;
    const baselineCombined: string | undefined = baselineRaw.combinedHash;

    const diffCaseIds: string[] = [];
    const currentKeys = new Set(Object.keys(caseMap));
    const baselineKeys = new Set(
        Object.keys(baselineCases).filter(
            (k) =>
                k !== 'combinedHash' &&
                k !== '__combinedHash__' &&
                k !== 'totalCases' &&
                k !== 'cases',
        ),
    );

    for (const k of currentKeys) {
        if (caseMap[k] !== baselineCases[k]) {
            diffCaseIds.push(k);
        }
    }
    for (const k of baselineKeys) {
        if (!currentKeys.has(k)) {
            diffCaseIds.push(`missing:${k}`);
        }
    }

    if (diffCaseIds.length === 0 && baselineCombined === combinedHash) {
        console.log('SNAPSHOT IDENTICAL');
        console.log(`Combined hash: ${combinedHash}`);
        console.log(
            `Checked ${currentKeys.size.toString()} plan snapshots across ${sets.length.toString()} answer sets.`,
        );
    } else {
        console.error('SNAPSHOT DIFFERING');
        console.error(`Differing case IDs (${diffCaseIds.length.toString()}):`);
        for (const id of diffCaseIds.slice(0, 20)) {
            console.error(
                `  - ${id}: current=${caseMap[id] ?? 'none'} baseline=${baselineCases[id] ?? 'none'}`,
            );
        }
        if (diffCaseIds.length > 20) {
            console.error(
                `  ... and ${(diffCaseIds.length - 20).toString()} more.`,
            );
        }
        process.exit(1);
    }
}

runSnapshot();
