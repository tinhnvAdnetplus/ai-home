import {
    type Floor,
    type Rect2,
    polygonOverlapArea,
    rectOverlapDepth,
} from '@aihome/bdm';
import { type Ctx, AREA_TOL_MM2, TOL, add } from './solid-context.js';

export function checkWalls(
    floor: Floor,
    solids: ReadonlyMap<string, Rect2>,
    ctx: Ctx,
): void {
    const walls = floor.walls.filter((w) => solids.has(w.id));
    for (const [i, a] of walls.entries()) {
        const ra = solids.get(a.id);
        if (!ra) continue;
        ctx.allowed += 1; // wall standing on its storey slab
        for (const b of walls.slice(i + 1)) {
            const rb = solids.get(b.id);
            if (!rb) continue;
            const depth = rectOverlapDepth(ra, rb);
            if (depth < -TOL) continue;
            if (depth <= TOL) {
                ctx.allowed += 1; // junction face contact
                continue;
            }
            const isAHorizontal = Math.abs(a.a.y - a.b.y) <= TOL;
            const isBHorizontal = Math.abs(b.a.y - b.b.y) <= TOL;
            const code =
                isAHorizontal === isBHorizontal
                    ? Math.abs(isAHorizontal ? a.a.y - b.a.y : a.a.x - b.a.x) <=
                      TOL
                        ? 'SOLID_WALL_DUPLICATE'
                        : 'SOLID_WALL_OVERLAP'
                    : 'SOLID_WALL_CROSSING';
            add(
                ctx,
                code,
                floor,
                [a.id, b.id],
                '壁の立体が重なっています',
                depth,
            );
        }
    }
    const skipped = floor.walls.length - walls.length;
    if (skipped > 0) {
        ctx.incomplete.add(
            `${floor.level.toString()}階の斜め壁 ${skipped.toString()} 枚は軸平行ボックスで近似できず、壁同士の干渉判定を省略しました。`,
        );
    }
}

export function checkSlabs(floor: Floor, ctx: Ctx): void {
    for (const [i, a] of floor.rooms.entries()) {
        ctx.allowed += 1; // room slab at storey elevation
        for (const b of floor.rooms.slice(i + 1)) {
            if (polygonOverlapArea(a.polygon, b.polygon) > AREA_TOL_MM2) {
                add(
                    ctx,
                    'SOLID_SLAB_OVERLAP',
                    floor,
                    [a.id, b.id],
                    `「${a.name}」と「${b.name}」の床が同一平面で重なっています（Zファイティングの原因）`,
                );
            }
        }
    }
}

export function footprintOf(solids: ReadonlyMap<string, Rect2>): Rect2 | null {
    let box: Rect2 | null = null;
    for (const r of solids.values()) {
        box = box
            ? {
                  minX: Math.min(box.minX, r.minX),
                  maxX: Math.max(box.maxX, r.maxX),
                  minY: Math.min(box.minY, r.minY),
                  maxY: Math.max(box.maxY, r.maxY),
              }
            : r;
    }
    return box;
}
