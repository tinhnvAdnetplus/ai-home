// i18n Completeness Audit CLI
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { URL } from 'node:url';
import console from 'node:console';
import process from 'node:process';
import { flatten, checkParity, checkJapanese } from './i18n-audit-rules.mjs';
import {
    getFiles,
    checkMissingKeys,
    checkHardcodedLiterals,
} from './i18n-audit-source.mjs';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const JS_DIR = join(ROOT, 'resources/js');
const LOCALES_DIR = join(JS_DIR, 'shared/i18n/locales');

const loadJson = (name) =>
    JSON.parse(readFileSync(join(LOCALES_DIR, name), 'utf8'));
const [jaFlat, enFlat, viFlat] = ['ja.json', 'en.json', 'vi.json'].map((f) =>
    flatten(loadJson(f)),
);
const [jaKeys, enKeys, viKeys] = [jaFlat, enFlat, viFlat].map(
    (d) => new Set(Object.keys(d)),
);

const issuesA = checkParity(jaKeys, enKeys, viKeys);
const issuesB = checkJapanese(enFlat, viFlat);
const issuesC = checkMissingKeys(
    jaKeys,
    getFiles(JS_DIR, ['.ts', '.tsx']),
    JS_DIR,
);
const issuesD = checkHardcodedLiterals(getFiles(JS_DIR, ['.tsx']), JS_DIR);

console.log('--- i18n Completeness Audit ---');
console.log(`(a) Key parity issues: ${issuesA.length}`);
console.log(`(b) Japanese in en/vi: ${issuesB.length}`);
console.log(`(c) Missing keys in t(): ${issuesC.length}`);
console.log(`(d) Hardcoded literals in TSX: ${issuesD.length}`);
console.log('-------------------------------');

const printSample = (lbl, items, fmt) => {
    if (items.length === 0) return;
    console.log(`\nSample ${lbl} (first 30):`);
    items.slice(0, 30).forEach((it, i) => console.log(` ${i + 1}. ${fmt(it)}`));
};

printSample('(a) Parity', issuesA, (it) => `[${it.type}] (${it.ns}) ${it.key}`);
printSample(
    '(b) Japanese in en/vi',
    issuesB,
    (it) => `[${it.lang}] ${it.key}: "${it.val}"`,
);
printSample(
    '(c) Missing keys in t()',
    issuesC,
    (it) => `${it.file} -> "${it.key}" (${it.resolved})`,
);
printSample(
    '(d) Hardcoded TSX',
    issuesD,
    (it) => `${it.file} [${it.type}] "${it.text}"`,
);

const total = issuesA.length + issuesB.length + issuesC.length + issuesD.length;
console.log(`\nTotal issues: ${total}`);
process.exit(total > 0 ? 1 : 0);
