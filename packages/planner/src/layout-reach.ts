import { type Floor } from '@aihome/bdm';
import { pointInPolygon, roomAt } from './layout-geometry.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';

function sharesEdge(
    a: Floor['rooms'][number]['polygon'],
    b: Floor['rooms'][number]['polygon'],
): boolean {
    for (let i = 0; i < a.length; i += 1) {
        const [p, q] = [a[i], a[(i + 1) % a.length]];
        if (!p || !q) continue;
        const len = Math.hypot(q.x - p.x, q.y - p.y);
        if (len === 0) continue;
        const [nx, ny] = [-(q.y - p.y) / len, (q.x - p.x) / len];
        for (let d = 150; d < len; d += 300) {
            const [mx, my] = [
                p.x + ((q.x - p.x) * d) / len,
                p.y + ((q.y - p.y) * d) / len,
            ];
            const isInside = pointInPolygon(mx + nx * 100, my + ny * 100, a);
            const [ox, oy] = isInside ? [-nx, -ny] : [nx, ny];
            if (pointInPolygon(mx + ox * 100, my + oy * 100, b)) return true;
        }
    }
    return false;
}

const CIRCULATION = OPEN_ROOM_TYPES;
const DOOR_KINDS = new Set(['door', 'slidingDoor', 'entrance']);

/** Rooms reachable through doors / open circulation boundaries, per floor. */
export function reachableRoomIds(
    floor: Floor,
    startIds: readonly string[],
): Set<string> {
    const links = new Map<string, Set<string>>();
    const link = (a: string, b: string): void => {
        if (a === b) return;
        (links.get(a) ?? links.set(a, new Set()).get(a))?.add(b);
        (links.get(b) ?? links.set(b, new Set()).get(b))?.add(a);
    };
    for (const o of floor.openings) {
        const wall = floor.walls.find((w) => w.id === o.wallId);
        if (!wall || !DOOR_KINDS.has(o.kind)) continue;
        const len = Math.max(
            1,
            Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y),
        );
        const t = (o.offsetMm + o.widthMm / 2) / len;
        const [mx, my] = [
            wall.a.x + (wall.b.x - wall.a.x) * t,
            wall.a.y + (wall.b.y - wall.a.y) * t,
        ];
        const [nx, ny] = [
            -(wall.b.y - wall.a.y) / len,
            (wall.b.x - wall.a.x) / len,
        ];
        const r1 = roomAt(floor, mx + nx * 200, my + ny * 200);
        const r2 = roomAt(floor, mx - nx * 200, my - ny * 200);
        if (r1 && r2) link(r1.id, r2.id);
    }
    // open boundaries between circulation rooms: sample points just outside every edge of A
    for (const a of floor.rooms) {
        for (const b of floor.rooms) {
            if (
                a.id >= b.id ||
                !CIRCULATION.has(a.type) ||
                !CIRCULATION.has(b.type)
            )
                continue;
            if (sharesEdge(a.polygon, b.polygon)) link(a.id, b.id);
        }
    }
    const seen = new Set(startIds);
    const queue = [...startIds];
    while (queue.length > 0) {
        const cur = queue.shift();
        for (const n of links.get(cur ?? '') ?? []) {
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
        }
    }
    return seen;
}
