import { type Point } from '@aihome/bdm';
import { computePointsBounds } from './plan2d-geometry';

type MainRect = {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly width: number;
    readonly height: number;
};

function isInside(x: number, y: number, poly: readonly Point[]): boolean {
    let isIn = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const [a, b] = [poly[i], poly[j]];
        if (
            a &&
            b &&
            a.y > y !== b.y > y &&
            x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
        ) {
            isIn = !isIn;
        }
    }
    return isIn;
}

/**
 * Largest axis-aligned rectangle inside a (rectilinear) room polygon. Furniture is laid out in it,
 * so L-shaped rooms never get items placed in their narrow arms or outside the room.
 */
export function computeMainRect(
    poly: readonly Point[],
    stepMm = 100,
): MainRect {
    const b = computePointsBounds(poly);
    const cols = Math.max(1, Math.round(b.width / stepMm));
    const rows = Math.max(1, Math.round(b.height / stepMm));
    const heights: number[] = new Array<number>(cols).fill(0);
    let best = { x0: 0, y0: 0, w: cols, h: rows, area: 0 };
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const isIn = isInside(
                b.minX + (c + 0.5) * stepMm,
                b.minY + (r + 0.5) * stepMm,
                poly,
            );
            heights[c] = isIn ? (heights[c] ?? 0) + 1 : 0;
        }
        for (let c = 0; c < cols; c += 1) {
            let minH = Infinity;
            for (let c2 = c; c2 < cols; c2 += 1) {
                minH = Math.min(minH, heights[c2] ?? 0);
                if (minH === 0) break;
                const area = minH * (c2 - c + 1);
                if (area > best.area)
                    best = {
                        x0: c,
                        y0: r - minH + 1,
                        w: c2 - c + 1,
                        h: minH,
                        area,
                    };
            }
        }
    }
    const minX = b.minX + best.x0 * stepMm;
    const minY = b.minY + best.y0 * stepMm;
    return {
        minX,
        minY,
        maxX: minX + best.w * stepMm,
        maxY: minY + best.h * stepMm,
        width: best.w * stepMm,
        height: best.h * stepMm,
    };
}
