import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { FIXTURE_KINDS, fixtureFootprintCells } from '@aihome/planner';

const promptPath = path.resolve(
    __dirname,
    '../../../../ai/prompts/layout.ja.md',
);

/** Rows of the fixture footprint table: `| kind | WxH | w×h | w×h |`. */
function readPromptFootprints(): Map<string, [string, string]> {
    const md = fs.readFileSync(promptPath, 'utf-8');
    const rows = new Map<string, [string, string]>();
    const re = /^\| (\w+) \| \d+×\d+ \| (\d+×\d+) \| (\d+×\d+) \|$/gm;
    for (const m of md.matchAll(re)) {
        rows.set(m[1] ?? '', [m[2] ?? '', m[3] ?? '']);
    }
    return rows;
}

describe('layout prompt fixture table', () => {
    it('lists every catalog kind with the cell footprint the checker uses', () => {
        const rows = readPromptFootprints();
        for (const kind of FIXTURE_KINDS) {
            const r0 = fixtureFootprintCells(kind, 0);
            const r90 = fixtureFootprintCells(kind, 90);
            expect(rows.get(kind), kind).toEqual([
                `${r0.wCells.toString()}×${r0.hCells.toString()}`,
                `${r90.wCells.toString()}×${r90.hCells.toString()}`,
            ]);
        }
        expect(rows.size).toBe(FIXTURE_KINDS.length);
    });
});
