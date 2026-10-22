import { type CanonicalPoint3, type Point } from '@aihome/bdm';
import { type Point3D } from './types.js';

/**
 * The ONE boundary between canonical BDM coordinates and Three.js world coordinates. No builder
 * may swap axes or flip signs on its own; they all go through these functions.
 *
 * Canonical (see bdm `coordinates.ts`): integer mm, right-handed, origin at the front-left
 * ground corner, +X = width (left -> right seen from the road), +Y = depth (road -> rear),
 * +Z = up.
 *
 * Three.js: metres, right-handed, Y-up. Mapping (a proper rotation, so handedness is kept):
 *   three.x =  X / 1000
 *   three.y =  Z / 1000
 *   three.z = -Y / 1000
 *
 * So the road-side facade lies on three.z = 0 facing +Z, and a camera at (+x, +y, +z) looking
 * towards -Z sees the front. Camera placement never feeds back into model coordinates.
 */
export const MM_TO_M = 0.001;

export function toThreeX(mm: number): number {
    return mm * MM_TO_M;
}

export function toThreeZ(yMm: number): number {
    return -yMm * MM_TO_M;
}

export function toThreeY(elevationMm: number): number {
    return elevationMm * MM_TO_M;
}

export function toThreePoint(point: Point, elevationMm: number): Point3D {
    return {
        x: toThreeX(point.x),
        y: toThreeY(elevationMm),
        z: toThreeZ(point.y),
    };
}

/** Canonical 3D point (mm) -> Three.js world point (m). */
export function canonicalToThree(p: CanonicalPoint3): Point3D {
    return { x: toThreeX(p.x), y: toThreeY(p.z), z: toThreeZ(p.y) };
}

/** Three.js world point (m) -> canonical 3D point (mm, not rounded). */
export function threeToCanonical(p: Point3D): CanonicalPoint3 {
    return { x: p.x / MM_TO_M, y: 0 - p.z / MM_TO_M, z: p.y / MM_TO_M };
}

export function computeSegmentAngle(dx: number, dz: number): number {
    return Math.atan2(-dz, dx);
}
