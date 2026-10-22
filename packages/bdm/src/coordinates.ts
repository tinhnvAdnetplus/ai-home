import { type ModelFace } from './orientation.js';
import { type Floor } from './types.js';

/**
 * Canonical building coordinate system (the one every BDM producer and consumer shares).
 *
 * - Units: integer millimetres. Renderers convert at their own single boundary
 *   (render3d `coords.ts`, elevation/cad-export projections) and nowhere else.
 * - Origin O = (0, 0, 0): front-left corner of the ground-floor footprint at ground level,
 *   "left" as seen standing on the road looking at the house.
 * - +X: building width, left -> right as seen from the road (frontage direction).
 * - +Y: building depth, from the road side (y = 0, the `front` face) towards the rear.
 * - +Z: elevation above the ground datum (Z = 0 = GL). BDM stores no per-point Z; it is
 *   derived from `Floor.elevationMm`, `Floor.heightMm`, `Opening.sillMm/heightMm` and the roof.
 * - Right-handed: X x Y = Z.
 *
 * Plan geometry (walls, rooms, openings, stairs, fixtures) is stored on wall CENTRELINES: a room
 * polygon edge is the centreline of the wall that bounds it, so the clear interior of a room is
 * its polygon inset by half of each bounding wall's thickness.
 *
 * Compass orientation is NOT part of these coordinates: the road side is always y = 0 and the
 * compass is resolved separately through `orientation.ts` (`compassToFace`, `sunFace`).
 */

/** Tolerance for every geometric comparison on canonical (integer mm) data. */
export const GEOMETRY_TOLERANCE_MM = 1;

/** The planner's module grid (尺モジュール) used by AI/rule-based layouts. */
export const DEFAULT_GRID_MM = 910;

/** Default wall thicknesses (centreline-based). Used by the planner and as renderer fallbacks. */
export const EXTERIOR_WALL_THICKNESS_MM = 150;
export const INTERIOR_WALL_THICKNESS_MM = 100;

/** Storey heights (floor-to-floor) the planner emits: GF includes the raised floor build-up. */
export const GROUND_STOREY_HEIGHT_MM = 2900;
export const UPPER_STOREY_HEIGHT_MM = 2800;

export type CanonicalPoint3 = {
    readonly x: number;
    readonly y: number;
    readonly z: number;
};

/** Grid cell corner (cell units, same axes as layout `rects`) -> canonical plan mm. */
export function gridToCanonical(
    cellX: number,
    cellY: number,
    gridMm: number = DEFAULT_GRID_MM,
): { readonly x: number; readonly y: number } {
    return { x: Math.round(cellX * gridMm), y: Math.round(cellY * gridMm) };
}

/** Floor elevations stacked from storey heights: floor n starts where floor n-1 ends. */
export function stackStoreyElevations(
    storeyHeightsMm: readonly number[],
): number[] {
    const out: number[] = [];
    let z = 0;
    for (const h of storeyHeightsMm) {
        out.push(z);
        z += h;
    }
    return out;
}

/** Planner storey height for a 1-based floor level. */
export function storeyHeightForLevel(level: number): number {
    return level === 1 ? GROUND_STOREY_HEIGHT_MM : UPPER_STOREY_HEIGHT_MM;
}

/** Vertical extent [bottom, top) of a storey in canonical Z. */
export function storeyZRange(floor: Floor): {
    readonly minZ: number;
    readonly maxZ: number;
} {
    return {
        minZ: floor.elevationMm,
        maxZ: floor.elevationMm + floor.heightMm,
    };
}

/** A point on a floor's plan lifted to canonical 3D at `heightAboveFloorMm`. */
export function liftToFloor(
    point: { readonly x: number; readonly y: number },
    floor: Floor,
    heightAboveFloorMm = 0,
): CanonicalPoint3 {
    return {
        x: point.x,
        y: point.y,
        z: floor.elevationMm + heightAboveFloorMm,
    };
}

/** Outward unit normal (canonical plan axes) of each model face. */
export function faceOutwardNormal(face: ModelFace): {
    readonly x: number;
    readonly y: number;
} {
    switch (face) {
        case 'front':
            return { x: 0, y: -1 };
        case 'back':
            return { x: 0, y: 1 };
        case 'left':
            return { x: -1, y: 0 };
        case 'right':
            return { x: 1, y: 0 };
    }
}
