import { type GridRoom } from './types.js';
import {
    type BandSpec,
    type RoomSpec,
    type LayoutContext,
} from './grid-types.js';
import { packWidths } from './grid-pack.js';

export { packWidths } from './grid-pack.js';

export function pushRect(
    out: GridRoom[],
    spec: RoomSpec,
    x: number,
    y: number,
    w: number,
    h: number,
    ctx: LayoutContext,
): GridRoom {
    const key = spec.key;
    if (spec.isMerge) {
        const existing = out.find((r) => r.key === key);
        if (existing) {
            existing.rects.push({ x, y, w, h });
            return existing;
        }
    }
    const newRoom: GridRoom = {
        id: `${ctx.floorName}-${key}-${(ctx.seq++).toString()}`,
        key,
        name: spec.name,
        type: spec.type,
        isMerge: spec.isMerge,
        rects: [{ x, y, w, h }],
        cells: 0,
        m2: 0,
        jo: 0,
    };
    out.push(newRoom);
    return newRoom;
}

export function measureRoom(room: GridRoom, cellM2: number): GridRoom {
    let cells = 0;
    for (const r of room.rects) cells += r.w * r.h;
    room.cells = cells;
    room.m2 = Math.round(cells * cellM2 * 1000) / 1000;
    room.jo = Math.round((cells / 2) * 10) / 10;
    return room;
}

export function layoutBand(
    band: BandSpec,
    W: number,
    y0: number,
    out: GridRoom[],
    ctx: LayoutContext,
): void {
    const widths = packWidths(W, band.items);
    let x = 0;
    for (let i = 0; i < band.items.length; i++) {
        const it = band.items[i];
        const w = widths[i] ?? 0;
        if (!it || w <= 0) continue;
        it.xPos = x;
        const rooms = it.rooms.filter((r): r is RoomSpec => r !== null);
        const depths: (number | null)[] = rooms.map((r) =>
            r.d === 'fill' ? null : r.d,
        );
        const hasFill = depths.some((d) => d === null);
        const fixed = depths.reduce((a: number, d) => a + (d ?? 0), 0);
        let over = fixed - band.depth + (hasFill ? 1 : 0);

        if (over > 0) {
            const order: { i: number; prio: number }[] = [];
            for (let ri = 0; ri < rooms.length; ri++) {
                if (depths[ri] === null) continue;
                const rType = rooms[ri]?.type;
                const prio = rType === 'closet' || rType === 'storage' ? 0 : 1;
                order.push({ i: ri, prio });
            }
            order.sort((a, b) => a.prio - b.prio || b.i - a.i);
            for (const o of order) {
                if (over <= 0) break;
                const curD = depths[o.i] ?? 0;
                const cut = Math.min(curD, over);
                depths[o.i] = curD - cut;
                over -= cut;
            }
        }

        let rest =
            band.depth - depths.reduce((a: number, d) => a + (d ?? 0), 0);
        let yy = y0;
        for (let ri = 0; ri < rooms.length; ri++) {
            const r = rooms[ri];
            if (!r) continue;
            const d = depths[ri] === null ? rest : (depths[ri] ?? 0);
            if (depths[ri] === null) rest = 0;
            if (d <= 0) continue;
            pushRect(out, r, x, yy, w, d, ctx);
            yy += d;
        }
        x += w;
    }
}
