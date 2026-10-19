import { type Polygon } from '@aihome/bdm';
import { type Box2D, type PlacementContext } from './furniture-types.js';

export function computePolygonBounds(poly: Polygon): Box2D {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const pt of poly) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
    }
    return { minX, minY, maxX, maxY };
}

export function isPointInPolygon(x: number, y: number, poly: Polygon): boolean {
    let isInside = false;
    const n = poly.length;
    for (let i = 0, j = n - 1; i < n; j = i, i += 1) {
        const pi = poly[i];
        const pj = poly[j];
        if (!pi || !pj) continue;
        const isIntersect =
            pi.y > y !== pj.y > y &&
            x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x;
        if (isIntersect) isInside = !isInside;
    }
    return isInside;
}

function segmentsIntersect(
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    p3x: number,
    p3y: number,
    p4x: number,
    p4y: number,
): boolean {
    const d = (p4y - p3y) * (p2x - p1x) - (p4x - p3x) * (p2y - p1y);
    if (Math.abs(d) < 1e-6) return false;
    const ua = ((p4x - p3x) * (p1y - p3y) - (p4y - p3y) * (p1x - p3x)) / d;
    const ub = ((p2x - p1x) * (p1y - p3y) - (p2y - p1y) * (p1x - p3x)) / d;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function doesBoxCrossEdges(box: Box2D, poly: Polygon): boolean {
    const bEdges = [
        [box.minX, box.minY, box.maxX, box.minY],
        [box.maxX, box.minY, box.maxX, box.maxY],
        [box.maxX, box.maxY, box.minX, box.maxY],
        [box.minX, box.maxY, box.minX, box.minY],
    ] as const;

    const n = poly.length;
    for (let i = 0, j = n - 1; i < n; j = i, i += 1) {
        const pi = poly[i];
        const pj = poly[j];
        if (!pi || !pj) continue;
        for (const [x1, y1, x2, y2] of bEdges) {
            if (segmentsIntersect(x1, y1, x2, y2, pi.x, pi.y, pj.x, pj.y)) {
                return true;
            }
        }
    }
    return false;
}

export function isBoxInsidePolygon(box: Box2D, poly: Polygon): boolean {
    if (!isPointInPolygon(box.minX, box.minY, poly)) return false;
    if (!isPointInPolygon(box.maxX, box.minY, poly)) return false;
    if (!isPointInPolygon(box.maxX, box.maxY, poly)) return false;
    if (!isPointInPolygon(box.minX, box.maxY, poly)) return false;
    if (
        !isPointInPolygon(
            (box.minX + box.maxX) / 2,
            (box.minY + box.maxY) / 2,
            poly,
        )
    )
        return false;
    return !doesBoxCrossEdges(box, poly);
}

export function canPlaceBox(
    box: Box2D,
    ctx: PlacementContext,
    marginMm = 40,
): boolean {
    const expanded: Box2D = {
        minX: box.minX - marginMm,
        minY: box.minY - marginMm,
        maxX: box.maxX + marginMm,
        maxY: box.maxY + marginMm,
    };
    if (!isBoxInsidePolygon(expanded, ctx.polygon)) return false;

    for (const ob of ctx.obstacles) {
        const nearX = Math.max(box.minX, Math.min(ob.x, box.maxX));
        const nearY = Math.max(box.minY, Math.min(ob.y, box.maxY));
        const distSq = (ob.x - nearX) ** 2 + (ob.y - nearY) ** 2;
        if (distSq < ob.radiusMm ** 2) return false;
    }

    for (const item of ctx.placed) {
        const isOverlap =
            box.minX < item.box.maxX &&
            box.maxX > item.box.minX &&
            box.minY < item.box.maxY &&
            box.maxY > item.box.minY;
        if (isOverlap) return false;
    }

    return true;
}
