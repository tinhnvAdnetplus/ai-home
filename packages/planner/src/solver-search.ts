import { sunFace } from '@aihome/bdm';
import { type PlanInput } from './types.js';
import { type AiLayout } from './ai-layout-schema.js';
import { buildableDepthM, houseFrontageM } from './site-layout.js';
import { solverProgram, joCells } from './solver-program.js';
import { buildLayout, type SolverDims } from './solver-layout.js';

const CELL_M2 = 0.8281;
const TSUBO_M2 = 3.305785;

type Scored = { readonly layout: AiLayout; readonly cost: number };

function cellsOf(layout: AiLayout, type: string, key?: string): number {
    let n = 0;
    for (const f of layout.floors)
        for (const r of f.rooms)
            if (r.type === type && (key === undefined || r.key === key))
                for (const rc of r.rects) n += rc.w * rc.h;
    return n;
}

/** Lower is better: total area against the target, room sizes against the wishes, storage padding. */
function cost(layout: AiLayout, v: PlanInput): number {
    const total =
        layout.floors.reduce((a, f) => a + layout.gridW * f.gridD, 0) -
        cellsOf(layout, 'balcony');
    const target = (v.targetArea * TSUBO_M2) / CELL_M2;
    const closet = cellsOf(layout, 'closet');
    const dev = (actual: number, want: number): number =>
        want > 0 ? Math.abs(actual - want) / want : 0;
    return (
        dev(total, target) * 100 +
        dev(cellsOf(layout, 'ldk'), joCells(v.ldkSize)) * 40 +
        dev(cellsOf(layout, 'bedroom'), joCells(v.masterSize)) * 40 +
        dev(cellsOf(layout, 'childRoom'), joCells(v.kidsSize) * v.kidsRooms) *
            40 +
        Math.max(0, closet / total - 0.15) * 100
    );
}

/**
 * Searches outlines inside the buildable area (setbacks, parking and coverage already applied
 * to `v`): front-row depth, back-row depth and width, and keeps the layout closest to the
 * customer's wishes. The house is sized from the lot first, so it cannot stick out of it.
 */
export function solveLayout(v: PlanInput, isMirror: boolean): AiLayout | null {
    const prog = solverProgram(v);
    if (!prog) return null;
    const maxW = Math.floor((houseFrontageM(v) - 1.0) / 0.91);
    const maxD = Math.floor(buildableDepthM(v) / 0.91);
    const lotM2 = Math.min(
        v.landAreaTsubo * TSUBO_M2,
        v.frontage * v.landDepth,
    );
    const maxCells = Math.floor(
        (lotM2 * (v.coverageLimit ?? 60)) / 100 / CELL_M2,
    );
    const sun = sunFace(v.roadSide);
    const isLdkLeft =
        sun === 'left' ? true : sun === 'right' ? false : !isMirror;
    const sunRow = sun === 'front' ? 'front' : 'back';
    let best: Scored | null = null;
    for (const dF of [2, 3, 4]) {
        for (let dB = 3; dB <= 8; dB += 1) {
            const D1 = dF + 1 + dB;
            if (D1 > maxD) break;
            const wA = Math.max(
                4,
                Math.ceil(D1 / 2),
                Math.round(prog.ldkCells / D1),
            );
            for (let W = wA + 4; W <= maxW && W * D1 <= maxCells; W += 1) {
                let layout: AiLayout | null = null;
                for (let dB2 = 3; dB2 <= dB && !layout; dB2 += 1) {
                    const dims: SolverDims = {
                        W,
                        dF,
                        dB,
                        dB2,
                        wA,
                        isLdkLeft,
                        sunRow,
                    };
                    layout = buildLayout(prog, dims);
                }
                if (!layout) continue;
                const c = cost(layout, v);
                if (!best || c < best.cost) best = { layout, cost: c };
                break; // the narrowest width that fits; wider only pads with storage
            }
        }
    }
    return best?.layout ?? null;
}
