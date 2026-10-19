import { type ProgramResult } from './program-types.js';
import { type VariantDefinition } from './variants.js';
import { type PlannerConfig } from './config.js';
import { type PlanInput } from './types.js';
import {
    calcMinW,
    resolveFor,
    type ResolvedDimensions,
} from './dimension-resolver.js';
import { sizeFootprint, type SizedFootprint } from './footprint-sizer.js';
import { cloneProgram } from './program-clone.js';
import {
    buildableDepthM,
    corridorAllowanceTsubo,
    hasOpenParking,
    houseFrontageM,
} from './site-layout.js';

export type SiteFit = {
    readonly parkingPlacement: 'front' | 'side';
    readonly setbackMode: 'standard' | 'tight';
};

export type FittedDimensions = ResolvedDimensions & SiteFit;

const STANDARD: SiteFit = {
    parkingPlacement: 'front',
    setbackMode: 'standard',
};

// tried in order; the first layout that fits the lot wins
export const SITE_FITS: readonly SiteFit[] = [
    STANDARD,
    { parkingPlacement: 'side', setbackMode: 'standard' },
    { parkingPlacement: 'front', setbackMode: 'tight' },
    { parkingPlacement: 'side', setbackMode: 'tight' },
];

/** Cells the footprint sticks out past the buildable area (setbacks, and the front yard when parking is there). */
function overflowCells(r: ResolvedDimensions, v: PlanInput): number {
    const maxW = Math.floor((houseFrontageM(v) - 1.0) / 0.91);
    const maxD = Math.floor(buildableDepthM(v) / 0.91);
    return Math.max(0, r.W - maxW) + Math.max(0, r.D1 - maxD);
}

/**
 * Standard setbacks with the parking in a front yard come first. When the house does not fit,
 * the stalls move beside the house, then the setbacks drop to the legal minimum. If nothing
 * fits, the layout that sticks out least is kept (the validators and the result page flag it).
 */
export function resolveDimensionsOnSite(
    prog: ProgramResult,
    variant: VariantDefinition,
    v: PlanInput,
    config: PlannerConfig,
): FittedDimensions {
    let best: { dims: FittedDimensions; over: number } | null = null;
    for (const fit of SITE_FITS) {
        const fv: PlanInput = { ...v, ...fit };
        if (fit.parkingPlacement === 'side') {
            if (!hasOpenParking(v)) continue;
            if (houseFrontageM(fv) < 1.0 + 6 * 0.91) continue;
        }
        const dims = resolveFor(cloneProgram(prog), variant, fv, config);
        const over = overflowCells(dims, fv);
        if (!best || over < best.over)
            best = { dims: { ...dims, ...fit }, over };
        if (over === 0) break;
    }
    // the first entry is always tried, so best is set
    return (
        best?.dims ?? {
            ...resolveFor(prog, variant, v, config),
            ...STANDARD,
        }
    );
}

export function pickSiteFit(d: FittedDimensions): SiteFit {
    return { parkingPlacement: d.parkingPlacement, setbackMode: d.setbackMode };
}

/** First footprint guess with the standard site layout, used to decide how wide the bands are. */
export function preSizeFootprint(
    v: PlanInput,
    prog: ProgramResult,
    variant: VariantDefinition,
    config: PlannerConfig,
): SizedFootprint {
    return sizeFootprint({
        targetAreaTsubo:
            v.targetArea + corridorAllowanceTsubo([prog.f1, prog.f2 ?? []]),
        floors: v.floors,
        frontage: v.frontage,
        buildableDepth: buildableDepthM(v),
        landAreaTsubo: v.landAreaTsubo,
        coverageLimit: v.coverageLimit ?? config.defaultCoverageLimit,
        floorRatioLimit: v.floorRatioLimit ?? config.defaultFloorRatioLimit,
        minW: calcMinW(prog),
        minD1:
            v.floors === 1
                ? v.targetArea <= 22
                    ? 7
                    : 8
                : v.targetArea <= 22
                  ? 6
                  : 7,
        minD2: v.floors === 2 ? 6 : 0,
        aspect: variant.aspect,
        cellM2: config.cellM2,
    });
}
