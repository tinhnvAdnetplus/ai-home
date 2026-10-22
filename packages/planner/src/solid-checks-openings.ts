import {
    type Floor,
    type Opening,
    type Rect2,
    rectOverlapDepth,
} from '@aihome/bdm';
import { type Ctx, TOL, add, openingRect } from './solid-context.js';

export function checkOpenings(
    floor: Floor,
    solids: ReadonlyMap<string, Rect2>,
    ctx: Ctx,
): void {
    const wallById = new Map(floor.walls.map((w) => [w.id, w]));
    for (const op of floor.openings) {
        const host = wallById.get(op.wallId);
        if (!host) continue; // reported by crossValidateBuildingModel (UNKNOWN_WALL_REF)
        if (op.sillMm < 0 || op.sillMm + op.heightMm > floor.heightMm + TOL) {
            add(
                ctx,
                'SOLID_OPENING_EXCEEDS_STOREY',
                floor,
                [op.id],
                `開口 ${op.id} の高さ（腰高${op.sillMm.toString()}+${op.heightMm.toString()}mm）が階高${floor.heightMm.toString()}mmを超えています`,
            );
        } else {
            ctx.allowed += 1; // slot inside its host wall
        }
        const slot = openingRect(host, op);
        if (!slot) {
            ctx.incomplete.add(
                `開口 ${op.id} は斜め壁上のため位置判定を省略しました。`,
            );
            continue;
        }
        for (const [wallId, r] of solids) {
            if (wallId === host.id) continue;
            const depth = rectOverlapDepth(slot, r);
            if (depth > TOL) {
                add(
                    ctx,
                    'SOLID_OPENING_AT_JUNCTION',
                    floor,
                    [op.id, wallId],
                    `開口 ${op.id} が交差する壁 ${wallId} の厚み内にかかっています`,
                    depth,
                );
            }
        }
    }
    const byWall = new Map<string, Opening[]>();
    for (const op of floor.openings) {
        const list = byWall.get(op.wallId) ?? [];
        list.push(op);
        byWall.set(op.wallId, list);
    }
    for (const ops of byWall.values()) {
        for (const [i, a] of ops.entries()) {
            for (const b of ops.slice(i + 1)) {
                const along =
                    Math.min(a.offsetMm + a.widthMm, b.offsetMm + b.widthMm) -
                    Math.max(a.offsetMm, b.offsetMm);
                const up =
                    Math.min(a.sillMm + a.heightMm, b.sillMm + b.heightMm) -
                    Math.max(a.sillMm, b.sillMm);
                if (along > TOL && up > TOL) {
                    add(
                        ctx,
                        'SOLID_OPENING_OVERLAP',
                        floor,
                        [a.id, b.id],
                        `同じ壁の開口 ${a.id} と ${b.id} が重なっています`,
                        Math.min(along, up),
                    );
                }
            }
        }
    }
}
