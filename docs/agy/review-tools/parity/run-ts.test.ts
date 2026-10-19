import fs from 'node:fs';
import { it } from 'vitest';
import { parseWizardConfig } from '/app/packages/config-schema/src/index';

it('dump ts results', () => {
const dir = '/app/apps/api/storage/tmp-mut';
const out: Record<string, { ok: boolean; codes: string[]; ms: number }> = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const raw = fs.readFileSync(`${dir}/${f}`, 'utf8');
    const t = performance.now();
    let result: { ok: boolean; codes: string[] };
    try {
        const parsed: unknown = JSON.parse(raw);
        const r = parseWizardConfig(parsed);
        result = r.ok ? { ok: true, codes: [] } : { ok: false, codes: [...new Set(r.issues.map((i) => i.code))].sort() };
    } catch {
        result = { ok: false, codes: ['SCHEMA_INVALID'] };
    }
    out[f] = { ...result, ms: Math.round((performance.now() - t) * 10) / 10 };
}
fs.writeFileSync(`${dir}/ts-result.txt`, JSON.stringify(out));
});
