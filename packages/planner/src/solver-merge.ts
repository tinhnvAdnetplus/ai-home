import { type AiLayout } from './ai-layout-schema.js';
import { type SolverRoom } from './solver-items.js';

type Floor = AiLayout['floors'][number];

/** One floor of the layout, with rooms that share a key (hall pieces) joined into one. */
export function mergeRooms(
    level: number,
    gridD: number,
    rooms: readonly SolverRoom[],
): Floor {
    const byKey = new Map<string, SolverRoom>();
    for (const r of rooms) {
        const prev = byKey.get(r.key);
        if (prev) prev.rects.push(...r.rects);
        else byKey.set(r.key, { ...r, rects: [...r.rects] });
    }
    return {
        level,
        gridD,
        rooms: [...byKey.values()].map((r) => ({
            key: r.key,
            name: r.name,
            type: r.type,
            rects: r.rects,
        })),
    };
}
