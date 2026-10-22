import { GEOMETRY_TOLERANCE_MM } from './coordinates.js';
import { type Rect2, rectOverlapArea } from './solids.js';
import { type Polygon } from './types.js';

/** Plan polygon operations used by the solid checks (canonical mm). */

export function rectOfPolygon(poly: Polygon): Rect2 {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of poly) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }
    return { minX, maxX, minY, maxY };
}

export function isPointInPolygon(x: number, y: number, poly: Polygon): boolean {
    let isInside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const pi = poly[i];
        const pj = poly[j];
        if (!pi || !pj) continue;
        if (
            pi.y > y !== pj.y > y &&
            x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x
        ) {
            isInside = !isInside;
        }
    }
    return isInside;
}

/** True when every polygon edge is horizontal or vertical (all planner rooms are). */
export function isRectilinear(poly: Polygon): boolean {
    for (let i = 0; i < poly.length; i += 1) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        if (!p || !q) continue;
        if (
            Math.abs(p.x - q.x) > GEOMETRY_TOLERANCE_MM &&
            Math.abs(p.y - q.y) > GEOMETRY_TOLERANCE_MM
        ) {
            return false;
        }
    }
    return true;
}

/**
 * Area (mm²) of the part of `rect` lying OUTSIDE `poly`. Exact for rectilinear polygons (the
 * plane is cut on every polygon/rect coordinate, so each sub-cell is wholly in or out); an
 * approximation for any other polygon.
 */
export function rectAreaOutsidePolygon(rect: Rect2, poly: Polygon): number {
    const xs = new Set<number>([rect.minX, rect.maxX]);
    const ys = new Set<number>([rect.minY, rect.maxY]);
    for (const p of poly) {
        if (p.x > rect.minX && p.x < rect.maxX) xs.add(p.x);
        if (p.y > rect.minY && p.y < rect.maxY) ys.add(p.y);
    }
    const sx = [...xs].sort((a, b) => a - b);
    const sy = [...ys].sort((a, b) => a - b);
    let outside = 0;
    for (let i = 0; i + 1 < sx.length; i += 1) {
        for (let j = 0; j + 1 < sy.length; j += 1) {
            const x0 = sx[i] ?? 0;
            const x1 = sx[i + 1] ?? 0;
            const y0 = sy[j] ?? 0;
            const y1 = sy[j + 1] ?? 0;
            if (!isPointInPolygon((x0 + x1) / 2, (y0 + y1) / 2, poly)) {
                outside += (x1 - x0) * (y1 - y0);
            }
        }
    }
    return outside;
}

/** Overlap area (mm²) of two polygons; exact when both are rectilinear. */
export function polygonOverlapArea(a: Polygon, b: Polygon): number {
    const ra = rectOfPolygon(a);
    const rb = rectOfPolygon(b);
    if (rectOverlapArea(ra, rb) <= 0) return 0;
    const xs = [...new Set([...a, ...b].map((p) => p.x))].sort((p, q) => p - q);
    const ys = [...new Set([...a, ...b].map((p) => p.y))].sort((p, q) => p - q);
    let area = 0;
    for (let i = 0; i + 1 < xs.length; i += 1) {
        for (let j = 0; j + 1 < ys.length; j += 1) {
            const x0 = xs[i] ?? 0;
            const x1 = xs[i + 1] ?? 0;
            const y0 = ys[j] ?? 0;
            const y1 = ys[j + 1] ?? 0;
            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;
            if (isPointInPolygon(cx, cy, a) && isPointInPolygon(cx, cy, b)) {
                area += (x1 - x0) * (y1 - y0);
            }
        }
    }
    return area;
}
