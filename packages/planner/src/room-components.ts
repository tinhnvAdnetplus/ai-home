import { type GridRect } from './types.js';

function isTouching(a: GridRect, b: GridRect): boolean {
    const isXTouch =
        (a.x + a.w === b.x || b.x + b.w === a.x) &&
        Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y);
    const isYTouch =
        (a.y + a.h === b.y || b.y + b.h === a.y) &&
        Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x);
    return isXTouch || isYTouch;
}

/** Split a room's rectangles into groups that are connected edge-to-edge. */
export function splitConnectedRects(rects: readonly GridRect[]): GridRect[][] {
    const groups: GridRect[][] = [];
    const left = [...rects];
    while (left.length > 0) {
        const first = left.shift();
        if (!first) break;
        const group = [first];
        let isGrowing = true;
        while (isGrowing) {
            isGrowing = false;
            for (let i = left.length - 1; i >= 0; i -= 1) {
                const r = left[i];
                if (r && group.some((g) => isTouching(g, r))) {
                    group.push(r);
                    left.splice(i, 1);
                    isGrowing = true;
                }
            }
        }
        groups.push(group);
    }
    return groups;
}
