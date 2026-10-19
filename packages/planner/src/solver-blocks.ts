import { rect, split, type RowItem, type SolverRoom } from './solver-items.js';

const HALL = { key: 'hall', name: 'ホール', type: 'hall' } as const;

/** Entrance on the road edge; in a deep row the part next to the hall becomes hall. */
export function entranceBlock(w: number): RowItem {
    return {
        id: 'entrance',
        target: w * 2,
        minW: w,
        maxW: w,
        isFlexible: false,
        minD: 2,
        build: (x, y, ww, d, hall) => {
            if (d <= 3) {
                return [
                    {
                        key: 'entrance',
                        name: '玄関',
                        type: 'entrance',
                        rects: [rect(x, y, ww, d)],
                    },
                ];
            }
            const { near, far } = split(x, y, ww, d, d - 2, hall);
            const rooms: SolverRoom[] = [{ ...HALL, rects: [near] }];
            if (far)
                rooms.push({
                    key: 'entrance',
                    name: '玄関',
                    type: 'entrance',
                    rects: [far],
                });
            return rooms;
        },
    };
}

/**
 * Straight stairs, 2 × 3 cells upright, or 3 × 2 lying along the row when the row is only
 * 2 deep. The landing is always on the hall edge, so the same block works on both floors.
 */
export function stairsBlock(depth: number): RowItem {
    const w = depth >= 3 ? 2 : 3;
    return {
        id: 'stairs',
        target: 6,
        minW: w,
        maxW: w,
        isFlexible: false,
        minD: 2,
        build: (x, y, ww, d, hall) => {
            const run = d >= 3 ? 3 : 2;
            const { near, far } = split(x, y, ww, d, run, hall);
            const rooms: SolverRoom[] = [
                { key: 'stairs', name: '階段', type: 'stairs', rects: [near] },
            ];
            if (far)
                rooms.push({
                    key: 'stairscl',
                    name: '収納',
                    type: 'closet',
                    rects: [far],
                });
            return rooms;
        },
    };
}

/**
 * Bath reached through the wash room: in a row 4+ deep the wash is on the hall edge and the
 * bath behind it; in a 3-deep row they sit side by side with storage in front of the bath.
 */
export function wetBlock(depth: number, id = 'wet'): RowItem {
    const w = depth >= 4 ? 2 : 4;
    return {
        id,
        target: 8,
        minW: w,
        maxW: w,
        isFlexible: false,
        minD: 2,
        build: (x, y, ww, d, hall) => {
            const wash = {
                key: `${id}wash`,
                name: '洗面脱衣室',
                type: 'wash',
            } as const;
            const bath = {
                key: `${id}bath`,
                name: '浴室',
                type: 'bath',
            } as const;
            if (d >= 4) {
                const { near, far } = split(x, y, ww, d, d - 2, hall);
                return far
                    ? [
                          { ...wash, rects: [near] },
                          { ...bath, rects: [far] },
                      ]
                    : [{ ...wash, rects: [near] }];
            }
            const left = rect(x, y, 2, d);
            if (d === 2) {
                return [
                    { ...wash, rects: [left] },
                    { ...bath, rects: [rect(x + 2, y, ww - 2, d)] },
                ];
            }
            const { near, far } = split(x + 2, y, ww - 2, d, d - 2, hall);
            const rooms: SolverRoom[] = [{ ...wash, rects: [left] }];
            if (far) rooms.push({ ...bath, rects: [far] });
            rooms.push({
                key: `${id}cl`,
                name: '収納',
                type: 'closet',
                rects: [near],
            });
            return rooms;
        },
    };
}

/** Master bedroom with its walk-in closet at one end, so the closet always opens off the bedroom. */
export function masterBlock(cells: number, hasWic: boolean): RowItem {
    const bedW = Math.max(3, Math.round(cells / 3));
    const wicW = hasWic ? 2 : 0;
    return {
        id: 'master',
        target: cells + wicW * 2,
        minW: 3 + wicW,
        maxW: bedW + wicW,
        isFlexible: false,
        minD: 3,
        build: (x, y, w, d) => {
            const rooms: SolverRoom[] = [
                {
                    key: 'master',
                    name: '主寝室',
                    type: 'bedroom',
                    rects: [rect(x, y, w - wicW, d)],
                },
            ];
            if (hasWic)
                rooms.push({
                    key: 'wic',
                    name: 'WIC',
                    type: 'closet',
                    rects: [rect(x + w - wicW, y, wicW, d)],
                });
            return rooms;
        },
    };
}
