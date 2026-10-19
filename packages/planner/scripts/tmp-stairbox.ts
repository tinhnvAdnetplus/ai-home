import { generatePlans } from '../src/index.ts';
import { TWO_STOREY_STANDARD_INPUT } from '../../../apps/api/resources/js/features/plan/data/sample-inputs.ts';
const plan: any = generatePlans(TWO_STOREY_STANDARD_INPUT).plans[0];
const f = plan.model.floors[0];
const st = f.rooms.find((r: any) => r.type === 'stairs');
const xs = st.polygon.map((q: any) => q.x),
    ys = st.polygon.map((q: any) => q.y);
const [x0, x1, y0, y1] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
];
console.log(
    'stairs bbox',
    [x0, y0, x1, y1].map((v: number) => v / 910),
);
for (const r of f.rooms) {
    if (r === st) continue;
    const rx = r.polygon.map((q: any) => q.x),
        ry = r.polygon.map((q: any) => q.y);
    const [a0, a1, b0, b1] = [
        Math.min(...rx),
        Math.max(...rx),
        Math.min(...ry),
        Math.max(...ry),
    ];
    const touchW = a1 === x0 && Math.min(b1, y1) > Math.max(b0, y0);
    const touchE = a0 === x1 && Math.min(b1, y1) > Math.max(b0, y0);
    const touchN = b1 === y0 && Math.min(a1, x1) > Math.max(a0, x0);
    const touchS = b0 === y1 && Math.min(a1, x1) > Math.max(a0, x0);
    if (touchW || touchE || touchN || touchS)
        console.log(
            ' neighbour',
            r.type,
            r.name,
            touchW ? 'W' : touchE ? 'E' : touchN ? 'N(road)' : 'S',
        );
}
const W = Math.max(...f.walls.flatMap((w: any) => [w.a.x, w.b.x]));
console.log(
    'building maxX',
    W / 910,
    '-> is stairs E edge (x=' + x1 / 910 + ') the exterior wall?',
    x1 === W,
);
for (const w of f.walls.filter((w: any) => w.kind === 'interior')) {
    const [ax, ay, bx, by] = [w.a.x, w.a.y, w.b.x, w.b.y];
    const onBoundary =
        (ax === bx &&
            (ax === x0 || ax === x1) &&
            Math.max(ay, by) > y0 &&
            Math.min(ay, by) < y1) ||
        (ay === by &&
            (ay === y0 || ay === y1) &&
            Math.max(ax, bx) > x0 &&
            Math.min(ax, bx) < x1);
    if (onBoundary) {
        const ops =
            f.openings
                .filter((o: any) => o.wallId === w.id)
                .map((o: any) => o.kind)
                .join(',') || 'NONE';
        console.log(
            ' wall-on-stairs-edge',
            [ax, ay, bx, by].map((v: number) => v / 910).join(','),
            'openings:',
            ops,
        );
    }
}

console.log('--- all rooms ---');
for (const r of f.rooms)
    console.log(
        r.type,
        r.name,
        JSON.stringify(r.polygon.map((q: any) => [q.x / 910, q.y / 910])),
    );
console.log('--- all interior walls ---');
for (const w of f.walls.filter((w: any) => w.kind === 'interior')) {
    const ops =
        f.openings
            .filter((o: any) => o.wallId === w.id)
            .map((o: any) => o.kind)
            .join(',') || 'NONE';
    console.log(
        [w.a.x, w.a.y, w.b.x, w.b.y].map((v: number) => v / 910).join(','),
        ops,
    );
}
console.log(
    'stairs polygon (full, not just bbox)',
    JSON.stringify(st.polygon.map((q: any) => [q.x / 910, q.y / 910])),
);

console.log('--- front wall + entrance opening ---');
const frontWall = f.walls.find((w: any) => w.id.includes('front'));
console.log('front wall', frontWall.id, JSON.stringify(frontWall));
const entOp = f.openings.find((o: any) => o.kind === 'entrance');
console.log('entrance opening', JSON.stringify(entOp));
console.log(
    'door center mm',
    entOp.offsetMm + entOp.widthMm / 2,
    'stairs x range mm',
    x0 * 910,
    x1 * 910,
);
