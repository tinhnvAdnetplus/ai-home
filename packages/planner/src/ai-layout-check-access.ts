import { type AiLayout, type AiLayoutRoom } from './ai-layout-schema.js';
import { containsPoint, edgesBetween, isStairsSideEdge } from './room-edges.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';

type AiLayoutFloor = AiLayout['floors'][number];

/** Rooms a stairs landing may open onto: circulation with no partition against the stairs. */
const LANDING_TYPES: ReadonlySet<string> = new Set([
    'hall',
    'corridor',
    'entrance',
    'ldk',
]);

/** Exempt from reachability, as in validateLayout: closets open off the room they serve. */
const REACH_EXEMPT: ReadonlySet<string> = new Set(['void', 'closet']);

/**
 * Stairs landing — the grid form of validateLayout's LAYOUT_STAIR_NO_LANDING and
 * LAYOUT_STAIR_BLOCKED. Every cell just past the landing edge (the y-large short side) must belong
 * to a circulation room: any other neighbour gets a partition wall across the landing, and the
 * outer wall leaves no landing at all.
 */
export function checkFloorStairsLanding(
    fl: AiLayoutFloor,
    gridW: number,
    tag: string,
): string[] {
    const errors: string[] = [];
    for (const st of fl.rooms.filter((r) => r.type === 'stairs')) {
        const rc = st.rects[0];
        if (!rc) continue;
        const y = rc.y + rc.h;
        const span = `y=${y.toString()} の辺, x=${rc.x.toString()}〜${(rc.x + rc.w).toString()}`;
        if (y >= fl.gridD || rc.x + rc.w > gridW) {
            errors.push(
                `${tag}「${st.name}」の踊り場（${span}）が外壁に面していて、出入口がありません。踊り場の辺はホール・廊下に接してください。`,
            );
            continue;
        }
        const blockers = new Set<string>();
        for (let x = rc.x; x < rc.x + rc.w; x += 1) {
            const next = fl.rooms.find((r) => containsPoint(r, x, y));
            if (!next || !LANDING_TYPES.has(next.type)) {
                blockers.add(next?.name ?? '空きセル');
            }
        }
        if (blockers.size > 0) {
            errors.push(
                `${tag}「${st.name}」の踊り場（${span}）が「${[...blockers].join('」「')}」に接していて、壁で塞がれます。踊り場の辺はすべてホール・廊下（または玄関・LDK）に接してください。`,
            );
        }
    }
    return errors;
}

/** Room keys linked by an open boundary (no partition) or by one of the floor's doors. */
function accessLinks(fl: AiLayoutFloor): Map<string, Set<string>> {
    const links = new Map<string, Set<string>>();
    const link = (a: string, b: string): void => {
        if (a === b) return;
        (links.get(a) ?? links.set(a, new Set()).get(a))?.add(b);
        (links.get(b) ?? links.set(b, new Set()).get(b))?.add(a);
    };
    const isWalled = (
        a: AiLayoutRoom,
        b: AiLayoutRoom,
        dir: 'v' | 'h',
        pos: number,
    ): boolean =>
        isStairsSideEdge(a, dir, pos) || isStairsSideEdge(b, dir, pos);
    for (const a of fl.rooms) {
        for (const b of fl.rooms) {
            if (
                a === b ||
                !OPEN_ROOM_TYPES.has(a.type) ||
                !OPEN_ROOM_TYPES.has(b.type)
            )
                continue;
            if (edgesBetween(a, b).some((e) => !isWalled(a, b, e.dir, e.pos)))
                link(a.key, b.key);
        }
    }
    for (const d of fl.doors ?? []) {
        const room = fl.rooms.find((r) => r.key === d.room);
        if (!room) continue;
        for (const other of fl.rooms) {
            if (other === room) continue;
            const isOnEdge = edgesBetween(room, other).some(
                (e) =>
                    e.dir === d.dir &&
                    e.pos === d.pos &&
                    d.a >= e.a &&
                    d.b <= e.b,
            );
            if (isOnEdge && !isWalled(room, other, d.dir, d.pos))
                link(room.key, other.key);
        }
    }
    // A stairs is entered from whatever lies past its landing. When that is a wrong room the
    // landing check already says so; linking it here keeps one bad landing from also listing
    // every room on the floor as unreachable.
    for (const st of fl.rooms.filter((r) => r.type === 'stairs')) {
        const rc = st.rects[0];
        if (!rc) continue;
        for (let x = rc.x; x < rc.x + rc.w; x += 1) {
            const next = fl.rooms.find((r) => containsPoint(r, x, rc.y + rc.h));
            if (next) link(st.key, next.key);
        }
    }
    return links;
}

/**
 * Reachability — the grid form of validateLayout's LAYOUT_UNREACHABLE. Walks open boundaries and
 * doors from the floor's way in (1F: the first entrance/hall, as validateLayout does; 2F: the
 * stairs) and lists every room that walk never reaches.
 */
export function checkFloorReach(fl: AiLayoutFloor, tag: string): string[] {
    const start =
        fl.level === 1
            ? fl.rooms.find((r) => r.type === 'entrance' || r.type === 'hall')
            : fl.rooms.find((r) => r.type === 'stairs');
    if (!start) return [];
    const links = accessLinks(fl);
    const seen = new Set([start.key]);
    const queue = [start.key];
    for (let cur = queue.shift(); cur !== undefined; cur = queue.shift()) {
        for (const n of links.get(cur) ?? []) {
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
        }
    }
    const lost = fl.rooms.filter(
        (r) => !seen.has(r.key) && !REACH_EXEMPT.has(r.type),
    );
    if (lost.length === 0) return [];
    const from = fl.level === 1 ? '玄関' : '階段';
    return [
        `${tag} ${from}から行けない部屋があります: ${lost.map((r) => r.name).join('、')}。ホール・廊下・LDKに開放で接するか、そこへ通じるドア(doors)を付けてください。`,
    ];
}
