import { type ProgramResult } from './program-types.js';
import { type VariantDefinition } from './variants.js';
import { type PlannerConfig } from './config.js';
import { type GridRoom, type PlanInput } from './types.js';
import { buildFloor } from './floor-builder.js';
import { sizeFootprint } from './footprint-sizer.js';
import { splitWideBands } from './narrow-bands.js';
import {
    buildableDepthM,
    corridorAllowanceTsubo,
    houseFrontageM,
} from './site-layout.js';

export function calcMinW(prog: ProgramResult): number {
    let m = 6;
    const allBands = [...prog.f1, ...(prog.f2 ?? [])];
    for (const b of allBands) {
        let bandMin = 0;
        for (const it of b.items) bandMin += it.min ?? 1;
        if (bandMin > m) m = bandMin;
    }
    return m;
}

export type ResolvedDimensions = {
    readonly W: number;
    readonly D1: number;
    readonly D2: number;
    readonly f1: {
        readonly name: string;
        readonly rooms: GridRoom[];
        readonly gridD: number;
    };
    readonly f2: {
        readonly name: string;
        readonly rooms: GridRoom[];
        readonly gridD: number;
    } | null;
    readonly droppedItems: readonly string[];
};

/** Footprint and floors for one site layout (parking placement and setbacks already in `v`). */
export function resolveFor(
    prog: ProgramResult,
    variant: VariantDefinition,
    v: PlanInput,
    config: PlannerConfig,
): ResolvedDimensions {
    const maxW = Math.max(6, Math.floor((houseFrontageM(v) - 1.0) / 0.91));

    let minW = calcMinW(prog);
    let guard = 0;
    const droppedItems: string[] = [];
    while (minW > maxW && guard++ < 12) {
        let target = null;
        let targetBand = null;
        const allBands = [...prog.f1, ...(prog.f2 ?? [])];
        for (const b of allBands) {
            for (const it of b.items) {
                if (
                    it.drop !== undefined &&
                    (!target || it.drop < (target.drop ?? 99))
                ) {
                    target = it;
                    targetBand = b;
                }
            }
        }
        if (!target || !targetBand) break;
        const idx = targetBand.items.indexOf(target);
        if (idx >= 0) {
            targetBand.items.splice(idx, 1);
            if (target.tag) droppedItems.push(target.tag);
        }
        minW = calcMinW(prog);
    }

    if (minW > maxW) {
        prog.f1 = splitWideBands(prog.f1, maxW, variant.narrow);
        if (prog.f2) prog.f2 = splitWideBands(prog.f2, maxW, variant.narrow);
        minW = calcMinW(prog);
    }

    const fixed1 = prog.f1.slice(0, -1).reduce((a, b) => a + b.depth, 0);
    const fixed2 = prog.f2
        ? prog.f2.slice(0, -1).reduce((a, b) => a + b.depth, 0)
        : 0;
    const lastBand1 = prog.f1[prog.f1.length - 1];
    const isWide = minW >= 9;
    const reqD1 = lastBand1
        ? v.targetArea <= 22 || isWide
            ? Math.min(4, lastBand1.depth)
            : lastBand1.depth
        : 4;
    const minD1 = fixed1 + reqD1;

    const lastBand2 = prog.f2 ? prog.f2[prog.f2.length - 1] : null;
    const reqD2 = lastBand2
        ? v.targetArea <= 22 || isWide
            ? 3
            : lastBand2.depth
        : 4;
    const minD2 = fixed2 + reqD2;

    const sized = sizeFootprint({
        // corridor rows (added so every room opens onto a hall) are not part of the customer's room wishes
        targetAreaTsubo:
            v.targetArea + corridorAllowanceTsubo([prog.f1, prog.f2 ?? []]),
        floors: v.floors,
        frontage: houseFrontageM(v),
        buildableDepth: buildableDepthM(v),
        landAreaTsubo: v.landAreaTsubo,
        coverageLimit: v.coverageLimit ?? config.defaultCoverageLimit,
        floorRatioLimit: v.floorRatioLimit ?? config.defaultFloorRatioLimit,
        minW,
        minD1,
        minD2,
        aspect: variant.aspect,
        cellM2: config.cellM2,
    });

    const W = Math.max(minW, sized.W);
    const D1 = Math.max(minD1, sized.D1);
    const D2 = prog.isTwoFloor ? Math.max(minD2, Math.min(D1, sized.D2)) : 0;

    const f1 = buildFloor(prog.f1, '1F', D1, W, config.cellM2);
    const f2 = prog.f2 ? buildFloor(prog.f2, '2F', D2, W, config.cellM2) : null;

    return { W, D1, D2, f1, f2, droppedItems };
}
