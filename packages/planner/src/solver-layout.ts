import { type AiLayout } from './ai-layout-schema.js';
import { rect, single, type RowItem, type SolverRoom } from './solver-items.js';
import { packRow, packRowAround } from './solver-pack.js';
import { mergeRooms as merge } from './solver-merge.js';
import { packTwoRows } from './solver-rows.js';
import { type SolverProgram } from './solver-program.js';

export type SolverDims = {
    readonly W: number;
    /** depth of the front row (road side), the hall row is 1 */
    readonly dF: number;
    readonly dB: number;
    /** depth of the second floor's back row (≤ dB) */
    readonly dB2: number;
    /** width of the full-depth LDK column */
    readonly wA: number;
    readonly isLdkLeft: boolean;
    /** the row (front or back) where the bedrooms go when it is deep enough */
    readonly sunRow: 'front' | 'back';
};

const HALL = { key: 'hall', name: 'ホール', type: 'hall' } as const;

/** LDK down the full depth of the house, so it reaches both the front and the back wall. */
function ldkColumn(d: SolverDims, D1: number): SolverRoom[] {
    const x = d.isLdkLeft ? 0 : d.W - d.wA;
    return [
        { key: 'ldk', name: 'LDK', type: 'ldk', rects: [rect(x, 0, d.wA, D1)] },
    ];
}

/** Items listed from the LDK side outwards, so the first one sits next to the LDK. */
const fromLdk = (items: RowItem[], d: SolverDims): RowItem[] =>
    d.isLdkLeft ? items : [...items].reverse();

/** Builds both floors for the given dimensions, or null when the rooms do not fit them. */
export function buildLayout(
    prog: SolverProgram,
    d: SolverDims,
): AiLayout | null {
    const D1 = d.dF + 1 + d.dB;
    const bx = d.isLdkLeft ? d.wA : 0;
    const bw = d.W - d.wA;
    const isTwo = prog.floors === 2;
    const isSunFront = d.sunRow === 'front';
    const fixedFront = isTwo
        ? [...prog.entrance(), prog.stairs(d.dF)]
        : prog.entrance();
    const g = packTwoRows({
        movables: prog.ground,
        isSunFront,
        dF: d.dF,
        dB: d.dB,
        fixedFront,
        // the pantry opens off the kitchen: first in the back row, next to the LDK
        fixedBack: prog.hasPantry
            ? [single('pantry', 'パントリー', 'pantry', 2, 1, 1, 2)]
            : [],
        packFront: (items) =>
            packRow(fromLdk(items, d), bx, bw, 0, d.dF, 'below', 'f1fl'),
        packBack: (items) =>
            packRow(fromLdk(items, d), bx, bw, d.dF + 1, d.dB, 'above', 'f1bl'),
    });
    if (!g) return null;
    const f1 = merge(1, D1, [
        ...ldkColumn(d, D1),
        ...g.front,
        { ...HALL, rects: [rect(bx, d.dF, bw, 1)] },
        ...g.back,
    ]);
    if (!isTwo) return { gridW: d.W, floors: [f1] };

    const stairs = g.front.find((r) => r.key === 'stairs')?.rects[0];
    if (!stairs) return null;
    const up = packTwoRows({
        movables: prog.upper,
        isSunFront,
        dF: d.dF,
        dB: d.dB2,
        fixedFront: [],
        fixedBack: [],
        packFront: (items) =>
            packRowAround(
                items,
                prog.stairs(d.dF),
                stairs.x,
                stairs.w,
                0,
                d.W,
                0,
                d.dF,
                'below',
                'f2fl',
                true,
            ),
        packBack: (items) =>
            packRow(items, 0, d.W, d.dF + 1, d.dB2, 'above', 'f2bl', true),
    });
    if (!up) return null;
    const D2 = d.dF + 1 + d.dB2;
    const f2 = merge(2, D2, [
        ...up.front,
        { ...HALL, rects: [rect(0, d.dF, d.W, 1)] },
        ...up.back,
    ]);
    return { gridW: d.W, floors: [f1, f2] };
}
