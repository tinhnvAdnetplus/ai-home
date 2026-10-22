import { GEOMETRY_TOLERANCE_MM } from './coordinates.js';
import { type Point, type Wall } from './types.js';
import {
    isAxisAlignedWall,
    wallLengthMm,
    wallThicknessMm,
} from './wall-geometry.js';

/**
 * Wall centrelines meet at points, but wall SOLIDS have thickness. Rendering every wall as a box
 * from `a` to `b` leaves a notch at each outer L-corner and buries the end of every T-joint stem
 * half-way inside the wall it abuts (coplanar top faces -> z-fighting). This resolves, for each
 * wall, the along-wall span its solid really occupies so that junctions become face-to-face
 * contacts with no gap and no overlap:
 *
 * - L corner: the dominant wall (exterior > interior, then thicker, then the X-direction wall)
 *   extends by half the other wall's thickness; the other wall is trimmed back to its face.
 * - T joint: the stem is trimmed to the face of the through wall; the through wall is unchanged.
 * - + joint: the dominant pair runs through, the other pair is trimmed to its faces.
 *
 * Only axis-aligned walls (everything the planner emits) are resolved; any other wall keeps its
 * raw centreline span [0, length].
 */
export type WallSpan = {
    /** Along-wall start, mm from `a` (negative = extended past `a`). */
    readonly startMm: number;
    /** Along-wall end, mm from `a` (> length = extended past `b`). */
    readonly endMm: number;
};

type AxisWall = {
    readonly wall: Wall;
    readonly isHorizontal: boolean;
    /** Constant coordinate of the centreline (y for horizontal, x for vertical). */
    readonly fixed: number;
    readonly min: number;
    readonly max: number;
    readonly halfThickness: number;
};

const TOL = GEOMETRY_TOLERANCE_MM;

function toAxisWall(wall: Wall): AxisWall | null {
    if (wallLengthMm(wall) < TOL || !isAxisAlignedWall(wall)) return null;
    const isHorizontal = Math.abs(wall.a.y - wall.b.y) <= TOL;
    return isHorizontal
        ? {
              wall,
              isHorizontal,
              fixed: wall.a.y,
              min: Math.min(wall.a.x, wall.b.x),
              max: Math.max(wall.a.x, wall.b.x),
              halfThickness: wallThicknessMm(wall) / 2,
          }
        : {
              wall,
              isHorizontal,
              fixed: wall.a.x,
              min: Math.min(wall.a.y, wall.b.y),
              max: Math.max(wall.a.y, wall.b.y),
              halfThickness: wallThicknessMm(wall) / 2,
          };
}

/** Along-centreline coordinate and cross coordinate of a point for a given wall orientation. */
function split(p: Point, isHorizontal: boolean): [number, number] {
    return isHorizontal ? [p.x, p.y] : [p.y, p.x];
}

function contains(w: AxisWall, p: Point): boolean {
    const [along, cross] = split(p, w.isHorizontal);
    return (
        Math.abs(cross - w.fixed) <= TOL &&
        along >= w.min - TOL &&
        along <= w.max + TOL
    );
}

function rank(w: AxisWall): number {
    return (
        (w.wall.kind === 'exterior' ? 1_000_000 : 0) +
        w.halfThickness * 10 +
        (w.isHorizontal ? 1 : 0)
    );
}

/**
 * Signed adjustment at one end of `w`: > 0 extends the solid outward past the centreline end
 * point, < 0 trims it back. `outward` is +1 at the wall's max end, -1 at its min end.
 */
function endAdjustment(
    w: AxisWall,
    endAlong: number,
    outward: 1 | -1,
    all: readonly AxisWall[],
): number {
    const end: Point = w.isHorizontal
        ? { x: endAlong, y: w.fixed }
        : { x: w.fixed, y: endAlong };
    let hasContinuation = false;
    let hasPositiveSide = false;
    let hasNegativeSide = false;
    let strongest: AxisWall | null = null;
    for (const o of all) {
        if (o === w || !contains(o, end)) continue;
        if (o.isHorizontal === w.isHorizontal) {
            const farAlong = outward > 0 ? o.max : o.min;
            if ((farAlong - endAlong) * outward > TOL) hasContinuation = true;
            continue;
        }
        const [crossAlongO] = split(end, o.isHorizontal);
        if (o.max - crossAlongO > TOL) hasPositiveSide = true;
        if (crossAlongO - o.min > TOL) hasNegativeSide = true;
        if (!strongest || rank(o) > rank(strongest)) strongest = o;
    }
    if (!strongest) return 0;
    const isThrough = hasPositiveSide && hasNegativeSide;
    const isDominant = rank(w) > rank(strongest);
    if (hasContinuation) {
        // + joint: only the subordinate pair is trimmed.
        return isThrough && !isDominant ? -strongest.halfThickness : 0;
    }
    if (isThrough) return -strongest.halfThickness; // stem of a T
    return isDominant ? strongest.halfThickness : -strongest.halfThickness; // L corner
}

/** Solid spans for every wall of one floor, keyed by wall id. */
export function resolveWallSpans(
    walls: readonly Wall[],
): ReadonlyMap<string, WallSpan> {
    const axis = walls.map(toAxisWall).filter((w): w is AxisWall => w !== null);
    const out = new Map<string, WallSpan>();
    for (const wall of walls) {
        out.set(wall.id, { startMm: 0, endMm: wallLengthMm(wall) });
    }
    for (const w of axis) {
        const len = wallLengthMm(w.wall);
        const [aAlong] = split(w.wall.a, w.isHorizontal);
        const isAMin = aAlong <= w.min + TOL;
        const minAdj = endAdjustment(w, w.min, -1, axis);
        const maxAdj = endAdjustment(w, w.max, 1, axis);
        const atA = isAMin ? minAdj : maxAdj;
        const atB = isAMin ? maxAdj : minAdj;
        out.set(w.wall.id, { startMm: 0 - atA, endMm: len + atB });
    }
    return out;
}
