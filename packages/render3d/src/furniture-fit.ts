import { canPlaceBox } from './furniture-bounds.js';
import { type Box2D, type PlacementContext } from './furniture-types.js';

/** Candidate boxes in the four corners of the room (far-from-entry corners first). */
export function cornerBoxes(
    bounds: Box2D,
    w: number,
    d: number,
    margin: number,
): Box2D[] {
    const xs = [bounds.minX + margin, bounds.maxX - margin - w];
    const ys = [bounds.minY + margin, bounds.maxY - margin - d];
    return [
        {
            minX: xs[0] ?? 0,
            minY: ys[0] ?? 0,
            maxX: (xs[0] ?? 0) + w,
            maxY: (ys[0] ?? 0) + d,
        },
        {
            minX: xs[1] ?? 0,
            minY: ys[0] ?? 0,
            maxX: (xs[1] ?? 0) + w,
            maxY: (ys[0] ?? 0) + d,
        },
        {
            minX: xs[0] ?? 0,
            minY: ys[1] ?? 0,
            maxX: (xs[0] ?? 0) + w,
            maxY: (ys[1] ?? 0) + d,
        },
        {
            minX: xs[1] ?? 0,
            minY: ys[1] ?? 0,
            maxX: (xs[1] ?? 0) + w,
            maxY: (ys[1] ?? 0) + d,
        },
    ];
}

/** Place at the first candidate that fits (inside the room, clear of doors and other items). */
export function tryFirstFit(
    boxes: readonly Box2D[],
    name: string,
    ctx: PlacementContext,
    build: (box: Box2D) => void,
): boolean {
    for (const box of boxes) {
        if (canPlaceBox(box, ctx)) {
            build(box);
            ctx.placed.push({ name, box });
            ctx.stats.placedCount += 1;
            return true;
        }
    }
    ctx.stats.skippedCount += 1;
    return false;
}
