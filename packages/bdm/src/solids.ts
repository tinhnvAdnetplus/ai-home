import { GEOMETRY_TOLERANCE_MM } from './coordinates.js';

/**
 * Axis-aligned solids in canonical mm (see `coordinates.ts`). A solid whose vertical extent is
 * not known carries `minZ`/`maxZ` = null: plan-view tests still work on it, but a 3D verdict is
 * only reached when the Z relationship is implied by something that IS known (e.g. two
 * floor-standing objects on the same storey always share Z from the floor up).
 */
export type Rect2 = {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
};

export type Box3 = Rect2 & {
    readonly minZ: number | null;
    readonly maxZ: number | null;
};

/**
 * - disjoint: separated by a positive gap.
 * - contact: touching at a face/edge/point (overlap depth within tolerance).
 * - penetration: interiors intersect.
 * - insufficient: the data cannot decide (unknown vertical extent).
 */
export type SolidRelation =
    'disjoint' | 'contact' | 'penetration' | 'insufficient';

export type RelationResult = {
    readonly relation: SolidRelation;
    /** Smallest per-axis overlap (mm). Negative = gap size. */
    readonly depthMm: number;
};

function axisOverlap(
    aMin: number,
    aMax: number,
    bMin: number,
    bMax: number,
): number {
    return Math.min(aMax, bMax) - Math.max(aMin, bMin);
}

export function rectOverlapDepth(a: Rect2, b: Rect2): number {
    return Math.min(
        axisOverlap(a.minX, a.maxX, b.minX, b.maxX),
        axisOverlap(a.minY, a.maxY, b.minY, b.maxY),
    );
}

export function rectOverlapArea(a: Rect2, b: Rect2): number {
    const ox = axisOverlap(a.minX, a.maxX, b.minX, b.maxX);
    const oy = axisOverlap(a.minY, a.maxY, b.minY, b.maxY);
    return ox > 0 && oy > 0 ? ox * oy : 0;
}

function classifyDepth(depth: number, tol: number): SolidRelation {
    if (depth < -tol) return 'disjoint';
    if (depth <= tol) return 'contact';
    return 'penetration';
}

/** Plan-view relationship of two footprints. */
export function classifyRects(
    a: Rect2,
    b: Rect2,
    tol: number = GEOMETRY_TOLERANCE_MM,
): RelationResult {
    const depth = rectOverlapDepth(a, b);
    return { relation: classifyDepth(depth, tol), depthMm: depth };
}

/** 3D relationship of two boxes; 'insufficient' only when the answer hinges on an unknown Z. */
export function classifyBoxes(
    a: Box3,
    b: Box3,
    tol: number = GEOMETRY_TOLERANCE_MM,
): RelationResult {
    const plan = rectOverlapDepth(a, b);
    if (plan < -tol) return { relation: 'disjoint', depthMm: plan };
    if (
        a.minZ === null ||
        a.maxZ === null ||
        b.minZ === null ||
        b.maxZ === null
    ) {
        return { relation: 'insufficient', depthMm: plan };
    }
    const depth = Math.min(plan, axisOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ));
    return { relation: classifyDepth(depth, tol), depthMm: depth };
}
