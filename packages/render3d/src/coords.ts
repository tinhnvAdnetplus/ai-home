import { type Point } from '@aihome/bdm';
import { type Point3D } from './types.js';

/**
 * Coordinate mapping: BDM (integer mm) -> Three.js (meters, Y-up).
 * - BDM X (mm, left-to-right frontage) maps to Three.js +X (m) = x / 1000
 * - BDM Y (mm, depth from road into plot) maps to Three.js -Z (m) = -y / 1000
 * - BDM elevation (mm, height above ground) maps to Three.js +Y (m) = elevation / 1000
 *
 * This places the road-side frontage at Z = 0 facing +Z, so standard Three.js
 * cameras located at (+X, +Y, +Z) looking toward -Z see the front facade.
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

export function computeSegmentAngle(dx: number, dz: number): number {
    return Math.atan2(-dz, dx);
}
