import { type GridRoom } from './types.js';
import {
    type Edge,
    edgesBetween,
    containsPoint,
    isStairsSideEdge,
} from './room-edges.js';

export { type Edge, edgesBetween } from './room-edges.js';
import { slideCrowdedDoors } from './door-spacing.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';

export type DoorSpec = {
    readonly dir: 'v' | 'h';
    readonly pos: number;
    readonly a: number;
    readonly b: number;
    readonly kind: 'slide' | 'swing';
    readonly room: string;
    readonly name: string;
    readonly side: number;
};

const CIRCULATION_TYPES = new Set([
    'hall',
    'corridor',
    'entrance',
    'stairs',
    'ldk',
]);
const OPEN_PAIR_TYPES = OPEN_ROOM_TYPES;
const STORAGE_TYPES = new Set(['closet', 'storage', 'pantry']);
const SLIDE_TYPES = new Set(['washitsu', 'closet', 'storage', 'pantry']);

export function buildDoors(rooms: readonly GridRoom[]): {
    doors: DoorSpec[];
    isolated: string[];
} {
    const adj: Record<string, { to: GridRoom; edge: Edge }[]> = {};
    for (const r of rooms) adj[r.id] = [];

    for (let i = 0; i < rooms.length; i++) {
        const roomA = rooms[i];
        if (!roomA) continue;
        for (let j = i + 1; j < rooms.length; j++) {
            const roomB = rooms[j];
            if (!roomB) continue;
            // Exclude the stairs' non-landing sides: they run alongside the flight itself, so a
            // door there would open onto thin air, not a walkable landing (see isStairsSideEdge).
            const e = edgesBetween(roomA, roomB).filter(
                (edge) =>
                    !isStairsSideEdge(roomA, edge.dir, edge.pos) &&
                    !isStairsSideEdge(roomB, edge.dir, edge.pos),
            );
            if (e.length === 0) continue;
            e.sort((p, q) => q.len - p.len);
            const bestEdge = e[0];
            if (!bestEdge) continue;
            adj[roomA.id]?.push({ to: roomB, edge: bestEdge });
            adj[roomB.id]?.push({ to: roomA, edge: bestEdge });
        }
    }

    // Cheapest-path search from the entrance: open links between circulation rooms cost 0,
    // a door from a circulation room costs 1, passing through a private room costs 6.
    const seen: Record<string, boolean> = {};
    const parent: Record<
        string,
        { from: GridRoom; edge: Edge; isOpen: boolean }
    > = {};
    const dist: Record<string, number> = {};
    const roots = rooms.filter((r) => r.type === 'entrance');
    const startRooms =
        roots.length > 0
            ? roots
            : rooms.filter((r) => CIRCULATION_TYPES.has(r.type)).slice(0, 1);
    const pending: GridRoom[] = [...startRooms];
    for (const r of startRooms) dist[r.id] = 0;
    const edgeCost = (cur: GridRoom, next: GridRoom): number => {
        if (OPEN_PAIR_TYPES.has(cur.type) && OPEN_PAIR_TYPES.has(next.type))
            return 0;
        if (cur.type === 'ldk' && next.type === 'pantry') return 0.5;
        if (OPEN_PAIR_TYPES.has(cur.type)) return 1;
        return STORAGE_TYPES.has(next.type) ? 1 : 6;
    };
    while (pending.length > 0) {
        pending.sort((p, q) => (dist[p.id] ?? 0) - (dist[q.id] ?? 0));
        const cur = pending.shift();
        if (!cur || seen[cur.id]) continue;
        seen[cur.id] = true;
        const links = [...(adj[cur.id] ?? [])].sort(
            (p, q) => q.edge.len - p.edge.len,
        );
        for (const lnk of links) {
            if (seen[lnk.to.id]) continue;
            const cost = edgeCost(cur, lnk.to);
            const nd = (dist[cur.id] ?? 0) + cost;
            if (
                dist[lnk.to.id] === undefined ||
                nd < (dist[lnk.to.id] ?? Infinity)
            ) {
                dist[lnk.to.id] = nd;
                parent[lnk.to.id] = {
                    from: cur,
                    edge: lnk.edge,
                    isOpen: cost === 0,
                };
                pending.push(lnk.to);
            }
        }
    }

    const doors: DoorSpec[] = [];
    for (const r of rooms) {
        const p = parent[r.id];
        if (!p || p.isOpen) continue;
        const e = p.edge;
        const isWide =
            r.type === 'closet' ||
            r.type === 'storage' ||
            r.type === 'washitsu' ||
            OPEN_PAIR_TYPES.has(r.type);
        const dw = Math.min(e.len <= 1 ? 0.7 : e.len - 0.2, isWide ? 1.8 : 0.9);
        // bedrooms: hug one corner so a wall stays free for the bed
        const isPrivate =
            r.type === 'bedroom' ||
            r.type === 'childRoom' ||
            r.type === 'study';
        const mid =
            isPrivate && e.len >= dw + 0.8
                ? e.a + 0.25 + dw / 2
                : (e.a + e.b) / 2;
        const inside =
            e.dir === 'v'
                ? containsPoint(r, e.pos, Math.floor(mid))
                    ? 1
                    : -1
                : containsPoint(r, Math.floor(mid), e.pos)
                  ? 1
                  : -1;
        doors.push({
            dir: e.dir,
            pos: e.pos,
            a: mid - dw / 2,
            b: mid + dw / 2,
            kind:
                SLIDE_TYPES.has(r.type) || OPEN_PAIR_TYPES.has(r.type)
                    ? 'slide'
                    : 'swing',
            room: r.key,
            name: r.name,
            side: inside,
        });
    }

    const finalDoors = slideCrowdedDoors(doors);

    const isolated = rooms
        .filter((r) => !seen[r.id] && r.type !== 'void')
        .map((r) => r.name);

    return { doors: finalDoors, isolated };
}
