// Sweep: does every plan fit its lot (or get flagged), and does the 3D site keep parking, path and shrubs apart?
// Run: docker compose exec -w /app/packages/planner vite node_modules/.bin/tsx scripts/site-fit-sweep.ts
import { generatePlansSafe } from '../src/index.ts';
import { DEFAULT_ANSWERS } from './sweep-generator.ts';
import {
    planSite,
    planShrubs,
    planTrees,
    houseGround,
    computeExtents,
    findEntrancePos,
} from '../../render3d/src/index.ts';
import { lotOverflow } from '../../../apps/api/resources/js/features/plan/lib/lot-fit.ts';
const st: Record<string, number> = {
    plans: 0,
    fits: 0,
    overflowFlaggedByBanner: 0,
    overflowMissed: 0,
    padHitsHouse: 0,
    padOutsideLot: 0,
    shrubOnPath: 0,
    padShallow: 0,
    shrubInHouse: 0,
    treeInHouse: 0,
    trees: 0,
};
for (const fr of [7, 9, 10, 12, 16])
    for (const de of [12, 14, 18, 24])
        for (const pt of ['two_story', 'one_story'])
            for (const cars of ['none', 'cars_1', 'cars_2', 'cars_3'])
                for (const opt of [[], ['carport']]) {
                    const answers = {
                        ...DEFAULT_ANSWERS,
                        frontage: fr,
                        depth: de,
                        land_area: Math.round((fr * de) / 3.3058),
                        plan_type: pt,
                        plan_parking_count: cars,
                        plan_parking_options: opt,
                    };
                    const res = generatePlansSafe(answers);
                    if (!res.ok) continue;
                    for (const p of res.data.plans) {
                        st.plans++;
                        const m = p.model;
                        const sb = m.site.setbacks;
                        const b = m.site.boundary;
                        const ws = m.floors.flatMap((f) => f.walls);
                        const out =
                            Math.max(...ws.flatMap((w) => [w.a.x, w.b.x])) >
                                Math.max(...b.map((q) => q.x)) -
                                    sb.rightMm +
                                    50 ||
                            Math.max(...ws.flatMap((w) => [w.a.y, w.b.y])) >
                                Math.max(...b.map((q) => q.y)) - sb.rearMm + 50;
                        const banner = lotOverflow(m) !== null;
                        if (!out) st.fits++;
                        else if (banner) st.overflowFlaggedByBanner++;
                        else st.overflowMissed++;
                        if (out) {
                            const k = `over_${pt}_${p.warnings.some((w) => w.code === 'COVERAGE_RATIO_EXCEEDED') ? 'coverageExceeded' : 'coverageOk'}`;
                            st[k] = (st[k] ?? 0) + 1;
                        }
                        const ext = computeExtents(m);
                        const lot = {
                            minX: ext.minX,
                            maxX: ext.maxX,
                            minZ: ext.minZ,
                            maxZ: ext.maxZ,
                        };
                        const house = {
                            minX: ext.houseMinX,
                            maxX: ext.houseMaxX,
                            minZ: ext.houseMinZ,
                            maxZ: ext.houseMaxZ,
                        };
                        const ent = findEntrancePos(m);
                        const sp = planSite({
                            lot,
                            house,
                            entX: ent.x,
                            spaces: m.parking.spaces,
                            kind: m.parking.kind,
                        });
                        const path = sp.keepClear[sp.keepClear.length - 1]!;
                        // greenery is placed with the house ground (roof overhang) kept clear, as in site-builder
                        const roof = houseGround(house);
                        const planted = [...sp.keepClear, roof];
                        const inRoof = (x: number, z: number): boolean =>
                            x > roof.minX &&
                            x < roof.maxX &&
                            z > roof.minZ &&
                            z < roof.maxZ;
                        if (
                            planShrubs(lot, planted).some((s) =>
                                inRoof(s.x, s.z),
                            )
                        )
                            st.shrubInHouse++;
                        const trees = planTrees(lot, planted);
                        st.trees += trees.length;
                        if (trees.some((t) => inRoof(t.x, t.z)))
                            st.treeInHouse++;
                        if (
                            planShrubs(lot, sp.keepClear).some(
                                (s) =>
                                    s.x > path.minX &&
                                    s.x < path.maxX &&
                                    s.z > path.minZ &&
                                    s.z < path.maxZ,
                            )
                        )
                            st.shrubOnPath++;
                        const pad = sp.parking;
                        if (!pad) continue;
                        if (
                            pad.minX < house.maxX &&
                            pad.maxX > house.minX &&
                            pad.minZ < house.maxZ + 0.2
                        )
                            st.padHitsHouse++;
                        if (
                            pad.minX < lot.minX + 0.29 ||
                            pad.maxX > lot.maxX - 0.29
                        )
                            st.padOutsideLot++;
                        if (pad.maxZ - pad.minZ < 4.6) st.padShallow++;
                    }
                }
console.log(st);
