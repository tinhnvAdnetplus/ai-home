import {
    filler,
    type HallEdge,
    type RowItem,
    type SolverRoom,
} from './solver-items.js';

/** Rooms of a packed row and how much it gave up: cells shrunk below the wish, plus spare width. */
export type Packed = { readonly rooms: SolverRoom[]; readonly loss: number };

const wantedW = (it: RowItem, depth: number): number =>
    Math.min(it.maxW, Math.max(it.minW, Math.round(it.target / depth)));

/** Widths for the items in a row of the given depth, or null when they cannot fit `width`. */
export function rowWidths(
    items: readonly RowItem[],
    width: number,
    depth: number,
): number[] | null {
    if (items.some((it) => it.minD > depth)) return null;
    const ws = items.map((it) => wantedW(it, depth));
    let sum = ws.reduce((a, b) => a + b, 0);
    // too long: shrink flexible items first, then any item, down to its minimum
    for (const isFlexOnly of [true, false]) {
        for (let i = 0; i < items.length && sum > width; i += 1) {
            const it = items[i];
            const cur = ws[i];
            if (!it || cur === undefined) continue;
            if (isFlexOnly && !it.isFlexible) continue;
            const cut = Math.min(cur - it.minW, sum - width);
            ws[i] = cur - cut;
            sum -= cut;
        }
    }
    if (sum > width) return null;
    // too short: widen flexible items only; fixed rooms stay at the size the customer asked for
    // and the rest becomes storage, or upstairs a balcony (packRow)
    for (let i = 0; i < items.length && sum < width; i += 1) {
        const it = items[i];
        const cur = ws[i];
        if (!it?.isFlexible || cur === undefined) continue;
        const add = Math.min(it.maxW - cur, width - sum);
        ws[i] = cur + add;
        sum += add;
    }
    return ws;
}

/**
 * Packs items left to right into a row (x0..x0+width, y0..y0+depth). Spare width becomes
 * storage (or, upstairs, an inner balcony) at the end of the row. Null when the items do not fit.
 */
export function packRow(
    items: readonly RowItem[],
    x0: number,
    width: number,
    y0: number,
    depth: number,
    hall: HallEdge,
    fillerId: string,
    isSpareBalcony = false,
): Packed | null {
    if (width <= 0) return items.length === 0 ? { rooms: [], loss: 0 } : null;
    const ws = rowWidths(items, width, depth);
    if (!ws) return null;
    const rooms: SolverRoom[] = [];
    let x = x0;
    let loss = 0;
    items.forEach((it, i) => {
        const w = ws[i] ?? it.minW;
        loss += Math.max(0, wantedW(it, depth) - w) * depth * 3;
        rooms.push(...it.build(x, y0, w, depth, hall));
        x += w;
    });
    const rest = x0 + width - x;
    if (rest > 0) {
        loss += rest * depth;
        rooms.push(
            ...filler(fillerId, isSpareBalcony, rest).build(
                x,
                y0,
                rest,
                depth,
                hall,
            ),
        );
    }
    return { rooms, loss };
}

/**
 * Packs a row around an item pinned at `pinX` (the stairs, which must sit over the stairs
 * below): items before the split go left of it, the rest right. Keeps the split that loses least.
 */
export function packRowAround(
    items: readonly RowItem[],
    pinned: RowItem,
    pinX: number,
    pinW: number,
    x0: number,
    width: number,
    y0: number,
    depth: number,
    hall: HallEdge,
    fillerId: string,
    isSpareBalcony = false,
): Packed | null {
    const leftW = pinX - x0;
    const rightW = x0 + width - pinX - pinW;
    if (leftW < 0 || rightW < 0) return null;
    let best: Packed | null = null;
    for (let k = 0; k <= items.length; k += 1) {
        const left = packRow(
            items.slice(0, k),
            x0,
            leftW,
            y0,
            depth,
            hall,
            `${fillerId}l`,
            isSpareBalcony,
        );
        if (!left) continue;
        const right = packRow(
            items.slice(k),
            pinX + pinW,
            rightW,
            y0,
            depth,
            hall,
            `${fillerId}r`,
            isSpareBalcony,
        );
        if (!right) continue;
        const loss = left.loss + right.loss;
        if (!best || loss < best.loss) {
            best = {
                rooms: [
                    ...left.rooms,
                    ...pinned.build(pinX, y0, pinW, depth, hall),
                    ...right.rooms,
                ],
                loss,
            };
        }
    }
    return best;
}
