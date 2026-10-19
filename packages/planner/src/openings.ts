import { type GridRoom } from './types.js';

export type WindowSpec = {
    readonly dir: 'v' | 'h';
    readonly pos: number;
    readonly a: number;
    readonly b: number;
    readonly isBig: boolean;
    readonly room: string;
    readonly kind: 'sash' | 'window' | 'small';
};

const WIN_BIG = new Set([
    'ldk',
    'washitsu',
    'bedroom',
    'childRoom',
    'guest',
    'study',
    'hobby',
]);
const WIN_SMALL = new Set([
    'bath',
    'wash',
    'toilet',
    'laundry',
    'hall',
    'stairs',
    'pantry',
]);

type WallEdge = {
    readonly dir: 'h' | 'v';
    readonly pos: number;
    readonly a: number;
    readonly b: number;
};

export function buildWindows(
    rooms: readonly GridRoom[],
    W: number,
    D: number,
): WindowSpec[] {
    const wins: WindowSpec[] = [];

    for (const r of rooms) {
        const isBig = WIN_BIG.has(r.type);
        const isSmall = WIN_SMALL.has(r.type);
        if (!isBig && !isSmall) continue;

        let placed = 0;
        const limit = isBig ? 2 : 1;
        const rects = [...r.rects].sort((a, b) => b.w * b.h - a.w * a.h);

        for (const rc of rects) {
            const edges: WallEdge[] = [];
            if (rc.y === 0)
                edges.push({ dir: 'h', pos: 0, a: rc.x, b: rc.x + rc.w });
            if (rc.y + rc.h === D)
                edges.push({ dir: 'h', pos: D, a: rc.x, b: rc.x + rc.w });
            if (rc.x === 0)
                edges.push({ dir: 'v', pos: 0, a: rc.y, b: rc.y + rc.h });
            if (rc.x + rc.w === W)
                edges.push({ dir: 'v', pos: W, a: rc.y, b: rc.y + rc.h });

            edges.sort((p, q) => {
                const pv = p.dir === 'h' && p.pos === D ? 0 : 1;
                const qv = q.dir === 'h' && q.pos === D ? 0 : 1;
                return pv - qv || q.b - q.a - (p.b - p.a);
            });

            for (const e of edges) {
                if (placed >= limit) break;
                const len = e.b - e.a;
                if (len < 1) continue;
                const wLen = isBig
                    ? Math.max(1.4, Math.min(len - 0.4, len * 0.72))
                    : Math.max(0.9, Math.min(len - 0.5, len * 0.62));
                if (wLen < 0.5) continue;

                const mid = (e.a + e.b) / 2;
                const isSash = r.type === 'ldk' && e.dir === 'h' && e.pos === D;
                const kind = isSash ? 'sash' : isBig ? 'window' : 'small';

                wins.push({
                    dir: e.dir,
                    pos: e.pos,
                    a: mid - wLen / 2,
                    b: mid + wLen / 2,
                    isBig,
                    room: r.key,
                    kind,
                });
                placed++;
            }
        }
    }
    return wins;
}
