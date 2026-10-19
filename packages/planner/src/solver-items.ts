import { type RoomType } from '@aihome/bdm';
import { type GridRect } from './types.js';

/** A room the solver places: one or more rects that share a key (hall pieces join up). */
export type SolverRoom = {
    readonly key: string;
    readonly name: string;
    readonly type: RoomType;
    readonly rects: GridRect[];
};

/** Which long edge of a row touches the hall row: the front row has the hall below (y max), the back row above. */
export type HallEdge = 'below' | 'above';

/**
 * One slot in a row. The packer gives it a width; `build` fills the w × d slot with rooms,
 * putting what needs a door (wash, toilet, stairs landing) on the hall edge.
 */
export type RowItem = {
    readonly id: string;
    /** desired cells (1 cell = 0.91 m × 0.91 m, 2 cells ≈ 1 帖) */
    readonly target: number;
    readonly minW: number;
    readonly maxW: number;
    /** may take spare width when the row is longer than the items */
    readonly isFlexible: boolean;
    /** smallest row depth the item works in */
    readonly minD: number;
    readonly build: (
        x: number,
        y: number,
        w: number,
        d: number,
        hall: HallEdge,
    ) => SolverRoom[];
};

const rect = (x: number, y: number, w: number, h: number): GridRect => ({
    x,
    y,
    w,
    h,
});

/** Splits a slot into a strip of depth `k` on the hall edge and the rest on the far edge. */
function split(
    x: number,
    y: number,
    w: number,
    d: number,
    k: number,
    hall: HallEdge,
): { near: GridRect; far: GridRect | null } {
    const kk = Math.min(k, d);
    const near =
        hall === 'below' ? rect(x, y + d - kk, w, kk) : rect(x, y, w, kk);
    if (kk === d) return { near, far: null };
    const far =
        hall === 'below' ? rect(x, y, w, d - kk) : rect(x, y + kk, w, d - kk);
    return { near, far };
}

export function single(
    id: string,
    name: string,
    type: RoomType,
    target: number,
    minW: number,
    maxW: number,
    minD = 1,
    isFlexible = false,
): RowItem {
    return {
        id,
        target,
        minW,
        maxW,
        isFlexible,
        minD,
        build: (x, y, w, d) => [
            { key: id, name, type, rects: [rect(x, y, w, d)] },
        ],
    };
}

/** A room of fixed depth on the hall edge with storage behind it (toilet, small rooms). */
export function nearWithCloset(
    id: string,
    name: string,
    type: RoomType,
    depth: number,
    w: number,
): RowItem {
    return {
        id,
        target: w * depth,
        minW: w,
        maxW: w,
        isFlexible: false,
        minD: depth,
        build: (x, y, ww, d, hall) => {
            const { near, far } = split(x, y, ww, d, depth, hall);
            const rooms: SolverRoom[] = [
                { key: id, name, type, rects: [near] },
            ];
            if (far)
                rooms.push({
                    key: `${id}cl`,
                    name: '収納',
                    type: 'closet',
                    rects: [far],
                });
            return rooms;
        },
    };
}

/**
 * Fills spare width at the end of a row: storage, or upstairs (when 2+ cells wide) an inner
 * balcony, which is not counted as floor area and does not pad the house with fake storage.
 */
export function filler(id: string, isBalcony = false, width = 1): RowItem {
    return isBalcony && width >= 2
        ? single(id, 'バルコニー', 'balcony', 1, 1, 99, 1, true)
        : single(id, '収納', 'closet', 1, 1, 99, 1, true);
}

export { rect, split };
