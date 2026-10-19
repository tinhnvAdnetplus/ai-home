import { type BandSpec, type LayoutContext } from './grid-types.js';
import { type GridRoom } from './types.js';
import { layoutBand, measureRoom, packWidths } from './grid.js';

function rangesOverlap(
    a1: number,
    a2: number,
    b1: number,
    b2: number,
): boolean {
    return Math.max(a1, b1) < Math.min(a2, b2);
}

function areRoomsAdjacent(rA: GridRoom, rB: GridRoom): boolean {
    for (const a of rA.rects) {
        for (const b of rB.rects) {
            const isXTouch =
                (a.x + a.w === b.x || b.x + b.w === a.x) &&
                rangesOverlap(a.y, a.y + a.h, b.y, b.y + b.h);
            const isYTouch =
                (a.y + a.h === b.y || b.y + b.h === a.y) &&
                rangesOverlap(a.x, a.x + a.w, b.x, b.x + b.w);
            if (isXTouch || isYTouch) return true;
        }
    }
    return false;
}

export function mergeAdjacentStorageRooms(
    rooms: GridRoom[],
    cellM2: number,
): void {
    let hasChanged = true;
    let guard = 0;
    while (hasChanged && guard++ < 20) {
        hasChanged = false;
        for (let i = 0; i < rooms.length; i++) {
            const rA = rooms[i];
            if (rA?.type !== 'closet' || rA.name !== '収納') continue;

            for (let j = i + 1; j < rooms.length; j++) {
                const rB = rooms[j];
                if (rB?.type !== 'closet' || rB.name !== '収納') continue;

                if (areRoomsAdjacent(rA, rB)) {
                    rA.rects.push(...rB.rects);
                    rooms.splice(j, 1);
                    measureRoom(rA, cellM2);
                    hasChanged = true;
                    break;
                }
            }
            if (hasChanged) break;
        }
    }
}

export function buildFloor(
    bandList: BandSpec[],
    name: string,
    totalDepth: number,
    W: number,
    cellM2: number,
): { name: string; rooms: GridRoom[]; gridD: number } {
    const rooms: GridRoom[] = [];
    const ctx: LayoutContext = { floorName: name, seq: 0 };
    const fixed = bandList.slice(0, -1).reduce((a, b) => a + b.depth, 0);
    const lastBand = bandList[bandList.length - 1];
    if (lastBand) {
        lastBand.depth = Math.max(2, totalDepth - fixed);
        if (lastBand.isLdk) {
            const ldkItem = lastBand.items.find((it) => it.tag === 'LDK');
            if (ldkItem?.targetCells) {
                // columns beside the LDK (pantry, storage) leave the rest of their column to the LDK:
                // count that towards the LDK target and re-pack until the sizes settle
                const depth = lastBand.depth;
                const apply = (w: number): void => {
                    ldkItem.w = w;
                    ldkItem.min = Math.min(4, w);
                    ldkItem.max = w;
                };
                apply(Math.max(4, Math.round(ldkItem.targetCells / depth)));
                for (let pass = 0; pass < 3; pass += 1) {
                    const widths = packWidths(W, lastBand.items);
                    const extra = lastBand.items.reduce(
                        (sum, it, i) =>
                            it !== ldkItem &&
                            it.rooms.some((r) => r?.key === 'ldk')
                                ? sum +
                                  (widths[i] ?? 0) * Math.max(0, depth - 2)
                                : sum,
                        0,
                    );
                    apply(
                        Math.max(
                            4,
                            Math.round((ldkItem.targetCells - extra) / depth),
                        ),
                    );
                }
            }
        }
    }
    let y = 0;
    for (const band of bandList) {
        layoutBand(band, W, y, rooms, ctx);
        y += band.depth;
    }
    mergeAdjacentStorageRooms(rooms, cellM2);
    for (const r of rooms) {
        measureRoom(r, cellM2);
    }
    return { name, rooms, gridD: totalDepth };
}

export function mirrorFloorRooms(rooms: readonly GridRoom[], W: number): void {
    for (const r of rooms) {
        for (const rc of r.rects) {
            rc.x = W - rc.x - rc.w;
        }
    }
}
