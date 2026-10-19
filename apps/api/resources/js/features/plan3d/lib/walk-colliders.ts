import { type Floor } from '@aihome/bdm';
import { MM_TO_M, toThreeX, toThreeZ } from '@aihome/render3d';

export type WalkSegment = {
    readonly ax: number;
    readonly az: number;
    readonly bx: number;
    readonly bz: number;
};

const PASSABLE_KINDS: readonly string[] = ['door', 'slidingDoor', 'entrance'];

function wallSegments(
    floor: Floor,
    wallId: string,
    ax: number,
    ay: number,
    bx: number,
    by: number,
): readonly WalkSegment[] {
    const len = Math.max(1, Math.hypot(bx - ax, by - ay));
    const gaps = floor.openings
        .filter((o) => o.wallId === wallId && PASSABLE_KINDS.includes(o.kind))
        .map((o) => [o.offsetMm, o.offsetMm + o.widthMm] as const)
        .sort((p, q) => p[0] - q[0]);
    const pointAt = (d: number): { x: number; z: number } => ({
        x: toThreeX(ax + ((bx - ax) * d) / len),
        z: toThreeZ(ay + ((by - ay) * d) / len),
    });
    const out: WalkSegment[] = [];
    let cursor = 0;
    for (const [from, to] of [...gaps, [len, len] as const]) {
        if (from > cursor) {
            const [p, q] = [pointAt(cursor), pointAt(from)];
            out.push({ ax: p.x, az: p.z, bx: q.x, bz: q.z });
        }
        cursor = Math.max(cursor, to);
    }
    return out;
}

export function buildColliders(floor: Floor): readonly WalkSegment[] {
    return floor.walls.flatMap((w) =>
        wallSegments(floor, w.id, w.a.x, w.a.y, w.b.x, w.b.y),
    );
}

export function resolveCollisions(
    pos: { x: number; z: number },
    radius: number,
    segments: readonly WalkSegment[],
): void {
    for (let pass = 0; pass < 2; pass += 1) {
        for (const s of segments) {
            const [dx, dz] = [s.bx - s.ax, s.bz - s.az];
            const lenSq = Math.max(1e-6, dx * dx + dz * dz);
            const t = Math.min(
                1,
                Math.max(
                    0,
                    ((pos.x - s.ax) * dx + (pos.z - s.az) * dz) / lenSq,
                ),
            );
            const [cx, cz] = [s.ax + dx * t, s.az + dz * t];
            const dist = Math.hypot(pos.x - cx, pos.z - cz);
            if (dist < radius) {
                const push = (radius - dist) / Math.max(dist, 1e-6);
                pos.x += (pos.x - cx) * push;
                pos.z += (pos.z - cz) * push;
            }
        }
    }
}

export function isInsideStairs(floor: Floor, x: number, z: number): boolean {
    const [px, py] = [x / MM_TO_M, -z / MM_TO_M];
    return floor.stairs.some((s) => {
        let isIn = false;
        const pts = s.polygon;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
            const [a, b] = [pts[i], pts[j]];
            if (
                a &&
                b &&
                a.y > py !== b.y > py &&
                px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x
            )
                isIn = !isIn;
        }
        return isIn;
    });
}
