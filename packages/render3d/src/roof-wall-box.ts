import { type Floor, resolveWallSpans, wallSolidRect } from '@aihome/bdm';
import { toThreeX, toThreeY, toThreeZ } from './coords.js';

export type FloorWallBox = {
    readonly minX: number;
    readonly maxX: number;
    readonly minZ: number;
    readonly maxZ: number;
    readonly yTop: number;
    /** Outer faces of the exterior wall solids (centreline box +/- half thickness). */
    readonly faces: {
        readonly x1: number;
        readonly x2: number;
        readonly z1: number;
        readonly z2: number;
    };
};

/** Outer-face box of the floor's exterior wall solids, in canonical mm. */
function exteriorFaceBox(floor: Floor): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
} | null {
    const spans = resolveWallSpans(floor.walls);
    let box: { minX: number; maxX: number; minY: number; maxY: number } | null =
        null;
    for (const w of floor.walls) {
        if (w.kind !== 'exterior') continue;
        const span = spans.get(w.id);
        const r = span ? wallSolidRect(w, span) : null;
        if (!r) continue;
        box = box
            ? {
                  minX: Math.min(box.minX, r.minX),
                  maxX: Math.max(box.maxX, r.maxX),
                  minY: Math.min(box.minY, r.minY),
                  maxY: Math.max(box.maxY, r.maxY),
              }
            : { ...r };
    }
    return box;
}

export function computeFloorWallBox(floor: Floor): FloorWallBox | null {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const w of floor.walls) {
        minX = Math.min(minX, w.a.x, w.b.x);
        maxX = Math.max(maxX, w.a.x, w.b.x);
        minY = Math.min(minY, w.a.y, w.b.y);
        maxY = Math.max(maxY, w.a.y, w.b.y);
    }
    if (!Number.isFinite(minX)) return null;
    const f = exteriorFaceBox(floor) ?? { minX, maxX, minY, maxY };
    return {
        minX: toThreeX(minX),
        maxX: toThreeX(maxX),
        minZ: toThreeZ(maxY),
        maxZ: toThreeZ(minY),
        yTop: toThreeY(floor.elevationMm + floor.heightMm),
        faces: {
            x1: toThreeX(f.minX),
            x2: toThreeX(f.maxX),
            z1: toThreeZ(f.maxY),
            z2: toThreeZ(f.minY),
        },
    };
}
