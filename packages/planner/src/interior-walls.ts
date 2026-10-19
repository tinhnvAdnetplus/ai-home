import { type Opening, type Wall } from '@aihome/bdm';
import { type DoorSpec } from './circulation.js';
import { type GridRoom } from './types.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';
import { isStairsSideEdge } from './room-edges.js';

/** Circulation / merged spaces: no partition between two of them. */
const OPEN_TYPES = OPEN_ROOM_TYPES;

type Run = {
    readonly dir: 'v' | 'h';
    readonly pos: number;
    a: number;
    b: number;
    readonly pair: string;
    /** True on the stairs' 3 non-landing sides: no opening may ever be cut here, regardless of
     * what a `doors` list (rule-based or AI-supplied) says — see isStairsSideEdge. */
    readonly isStairsWall: boolean;
};

function ownerMap(rooms: readonly GridRoom[]): Map<string, GridRoom> {
    const map = new Map<string, GridRoom>();
    for (const r of rooms) {
        for (const rc of r.rects) {
            for (let x = rc.x; x < rc.x + rc.w; x++) {
                for (let y = rc.y; y < rc.y + rc.h; y++) {
                    map.set(`${x.toString()},${y.toString()}`, r);
                }
            }
        }
    }
    return map;
}

function collectRuns(rooms: readonly GridRoom[], W: number, D: number): Run[] {
    const owner = ownerMap(rooms);
    const get = (x: number, y: number): GridRoom | undefined =>
        owner.get(`${x.toString()},${y.toString()}`);
    const runs: Run[] = [];
    const push = (
        dir: 'v' | 'h',
        pos: number,
        at: number,
        r: GridRoom,
        s: GridRoom,
    ): void => {
        if (r === s) return;
        // The stairs' non-landing sides run alongside the flight itself: always draw a real
        // wall there, even though `stairs` is otherwise an "open" type (landing <-> hall/LDK).
        const isStairsWall =
            isStairsSideEdge(r, dir, pos) || isStairsSideEdge(s, dir, pos);
        if (!isStairsWall && OPEN_TYPES.has(r.type) && OPEN_TYPES.has(s.type))
            return;
        const pair = [r.id, s.id].sort().join('|');
        const last = runs[runs.length - 1];
        if (
            last?.dir === dir &&
            last.pos === pos &&
            last.pair === pair &&
            last.b === at
        ) {
            last.b = at + 1;
        } else {
            runs.push({
                dir,
                pos,
                a: at,
                b: at + 1,
                pair,
                isStairsWall,
            });
        }
    };
    for (let x = 1; x < W; x++) {
        for (let y = 0; y < D; y++) {
            const [l, r] = [get(x - 1, y), get(x, y)];
            if (l && r) push('v', x, y, l, r);
        }
    }
    for (let y = 1; y < D; y++) {
        for (let x = 0; x < W; x++) {
            const [t, b] = [get(x, y - 1), get(x, y)];
            if (t && b) push('h', y, x, t, b);
        }
    }
    return runs;
}

export function buildInteriorWalls(
    level: number,
    rooms: readonly GridRoom[],
    doors: readonly DoorSpec[],
    W: number,
    D: number,
    gridMm: number,
    firstOpeningSeq: number,
): { walls: Wall[]; openings: Opening[] } {
    const walls: Wall[] = [];
    const openings: Opening[] = [];
    let seq = firstOpeningSeq;
    runs: for (const [i, run] of collectRuns(rooms, W, D).entries()) {
        const id = `wall-${level.toString()}-int-${i.toString()}`;
        const pt = (along: number): { x: number; y: number } =>
            run.dir === 'v'
                ? { x: run.pos * gridMm, y: along * gridMm }
                : { x: along * gridMm, y: run.pos * gridMm };
        walls.push({
            id,
            a: pt(run.a),
            b: pt(run.b),
            thicknessMm: 100,
            kind: 'interior',
        });
        if (run.isStairsWall) continue;
        for (const d of doors) {
            if (d.dir !== run.dir || d.pos !== run.pos) continue;
            if (d.a < run.a - 0.01 || d.b > run.b + 0.01) continue;
            openings.push({
                id: `open-${level.toString()}-${(seq++).toString()}`,
                wallId: id,
                offsetMm: Math.round((d.a - run.a) * gridMm),
                widthMm: Math.max(600, Math.round((d.b - d.a) * gridMm)),
                heightMm: 2000,
                sillMm: 0,
                kind: d.kind === 'slide' ? 'slidingDoor' : 'door',
            });
            continue runs;
        }
    }
    return { walls, openings };
}
