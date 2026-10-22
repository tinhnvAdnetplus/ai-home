import {
    EXTERIOR_WALL_THICKNESS_MM,
    GEOMETRY_TOLERANCE_MM,
} from './coordinates.js';
import { type Rect2 } from './solids.js';
import { type Wall } from './types.js';
import { type WallSpan } from './wall-joints.js';

const TOL = GEOMETRY_TOLERANCE_MM;

export function wallLengthMm(wall: Wall): number {
    return Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y);
}

export function wallThicknessMm(wall: Wall): number {
    return wall.thicknessMm > 0 ? wall.thicknessMm : EXTERIOR_WALL_THICKNESS_MM;
}

export function isAxisAlignedWall(wall: Wall): boolean {
    return (
        Math.abs(wall.a.x - wall.b.x) <= TOL ||
        Math.abs(wall.a.y - wall.b.y) <= TOL
    );
}

/** Axis-aligned plan rectangle of a wall solid over its resolved span (null if not axis-aligned). */
export function wallSolidRect(wall: Wall, span: WallSpan): Rect2 | null {
    const len = wallLengthMm(wall);
    if (len < TOL || !isAxisAlignedWall(wall)) return null;
    const ux = (wall.b.x - wall.a.x) / len;
    const uy = (wall.b.y - wall.a.y) / len;
    const p0 = {
        x: wall.a.x + ux * span.startMm,
        y: wall.a.y + uy * span.startMm,
    };
    const p1 = { x: wall.a.x + ux * span.endMm, y: wall.a.y + uy * span.endMm };
    const half = wallThicknessMm(wall) / 2;
    const isHorizontal = Math.abs(uy) < 0.5;
    return isHorizontal
        ? {
              minX: Math.min(p0.x, p1.x),
              maxX: Math.max(p0.x, p1.x),
              minY: wall.a.y - half,
              maxY: wall.a.y + half,
          }
        : {
              minX: wall.a.x - half,
              maxX: wall.a.x + half,
              minY: Math.min(p0.y, p1.y),
              maxY: Math.max(p0.y, p1.y),
          };
}
