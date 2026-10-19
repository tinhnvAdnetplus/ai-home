export type Edge = {
    readonly dir: 'v' | 'h';
    readonly pos: number;
    readonly a: number;
    readonly b: number;
    readonly len: number;
};

/** The minimal shape these geometry helpers need — satisfied by both `GridRoom` (the rule-based
 * pipeline) and `AiLayoutRoom` (the AI's own room list), so the same checks apply to both. */
export type EdgeRoom = {
    readonly type: string;
    readonly rects: readonly { x: number; y: number; w: number; h: number }[];
};

export function edgesBetween(a: EdgeRoom, b: EdgeRoom): Edge[] {
    const res: Edge[] = [];
    for (const r1 of a.rects) {
        for (const r2 of b.rects) {
            if (r1.x + r1.w === r2.x || r2.x + r2.w === r1.x) {
                const y0 = Math.max(r1.y, r2.y);
                const y1 = Math.min(r1.y + r1.h, r2.y + r2.h);
                if (y1 - y0 >= 1) {
                    res.push({
                        dir: 'v',
                        pos: r1.x + r1.w === r2.x ? r2.x : r1.x,
                        a: y0,
                        b: y1,
                        len: y1 - y0,
                    });
                }
            }
            if (r1.y + r1.h === r2.y || r2.y + r2.h === r1.y) {
                const x0 = Math.max(r1.x, r2.x);
                const x1 = Math.min(r1.x + r1.w, r2.x + r2.w);
                if (x1 - x0 >= 1) {
                    res.push({
                        dir: 'h',
                        pos: r1.y + r1.h === r2.y ? r2.y : r1.y,
                        a: x0,
                        b: x1,
                        len: x1 - x0,
                    });
                }
            }
        }
    }
    return res;
}

export function containsPoint(room: EdgeRoom, x: number, y: number): boolean {
    for (const r of room.rects) {
        if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return true;
    }
    return false;
}

/**
 * True for every edge of a `stairs` room except its landing (the y-large short side, where the
 * flight actually reaches the floor). The other three sides run alongside the flight itself —
 * there is no floor to step onto there, so they must stay solid walls and must never get a door,
 * no matter which room sits on the other side. Always false for non-stairs rooms.
 */
export function isStairsSideEdge(
    room: EdgeRoom,
    dir: 'v' | 'h',
    pos: number,
): boolean {
    if (room.type !== 'stairs') return false;
    const rc = room.rects[0];
    if (!rc) return false;
    return !(dir === 'h' && pos === rc.y + rc.h);
}
