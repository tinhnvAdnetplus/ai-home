import { mapAnswersToPlanInput, generatePlans } from '../src/index.ts';
import { defaultWizard } from '../../../apps/api/resources/js/features/wizard/data/default-wizard.ts';
import { resolveWizardState } from '../../config-schema/src/index.ts';
import { pointInPolygon } from '../src/layout-geometry.ts';

const raw: Record<string, unknown> = {};
for (const st of defaultWizard.steps)
    for (const sec of st.sections)
        for (const f of sec.fields)
            if (f.defaultValue !== undefined) raw[f.key] = f.defaultValue;

function toRects(
    poly: { x: number; y: number }[],
): { x: number; y: number; w: number; h: number }[] {
    const xs = poly.map((p) => p.x / 910),
        ys = poly.map((p) => p.y / 910);
    const [x0, x1, y0, y1] = [
        Math.min(...xs),
        Math.max(...xs),
        Math.min(...ys),
        Math.max(...ys),
    ];
    const rows: { y: number; runs: [number, number][] }[] = [];
    for (let y = y0; y < y1; y++) {
        const runs: [number, number][] = [];
        let start = -1;
        for (let x = x0; x <= x1; x++) {
            const isIn =
                x < x1 &&
                pointInPolygon((x + 0.5) * 910, (y + 0.5) * 910, poly);
            if (isIn && start < 0) start = x;
            if (!isIn && start >= 0) {
                runs.push([start, x]);
                start = -1;
            }
        }
        rows.push({ y, runs });
    }
    const out: { x: number; y: number; w: number; h: number }[] = [];
    const open = new Map<
        string,
        { x: number; y: number; w: number; h: number }
    >();
    for (const row of rows) {
        const seen = new Set<string>();
        for (const [a, b] of row.runs) {
            const k = `${a}-${b}`;
            seen.add(k);
            const cur = open.get(k);
            if (cur && cur.y + cur.h === row.y) cur.h += 1;
            else {
                const r = { x: a, y: row.y, w: b - a, h: 1 };
                open.set(k, r);
                out.push(r);
            }
        }
        for (const k of [...open.keys()]) if (!seen.has(k)) open.delete(k);
    }
    return out;
}

function exportCase(label: string, over: Record<string, unknown>): void {
    const { answers } = resolveWizardState(defaultWizard, { ...raw, ...over });
    const input = mapAnswersToPlanInput({ ...answers }).input;
    const plan: any = generatePlans(input).plans[0];
    const fl = plan.model.floors;
    const W =
        Math.max(...fl[0].walls.flatMap((w: any) => [w.a.x, w.b.x])) / 910;
    const layout = {
        gridW: W,
        floors: fl.map((f: any) => ({
            level: f.level,
            gridD:
                Math.max(...f.walls.flatMap((w: any) => [w.a.y, w.b.y])) / 910,
            rooms: f.rooms.map((r: any, i: number) => ({
                key: `${r.type}${i}`,
                name: r.name,
                type: r.type,
                rects: toRects(r.polygon),
            })),
        })),
    };
    console.log(
        '=== ' +
            label +
            ' ' +
            JSON.stringify({
                frontage: input.frontage,
                depth: input.landDepth,
                floors: input.floors,
                tsubo: input.targetArea,
            }),
    );
    console.log(JSON.stringify(layout));
}
exportCase('two-storey', {
    frontage: 12,
    depth: 20,
    land_area: 73,
    plan_type: 'two_story',
    floors: 'two_story',
    plan_target_area: 35,
});
exportCase('one-storey', {
    frontage: 12,
    depth: 20,
    land_area: 73,
    plan_type: 'one_story',
    floors: 'one_story',
    plan_target_area: 30,
});
