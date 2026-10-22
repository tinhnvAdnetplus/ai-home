import {
    type BuildingModel,
    type Floor,
    type Rect2,
    polygonOverlapArea,
} from '@aihome/bdm';
import { type Ctx, AREA_TOL_MM2, TOL, add } from './solid-context.js';

export function checkStoreys(
    floors: readonly Floor[],
    footprints: ReadonlyMap<number, Rect2 | null>,
    ctx: Ctx,
): void {
    for (const [i, upper] of floors.entries()) {
        if (upper.heightMm <= 0) {
            ctx.incomplete.add(`${upper.level.toString()}階の階高が不明です。`);
        }
        const lower = floors[i - 1];
        if (!lower) continue;
        const expected = lower.elevationMm + lower.heightMm;
        const gap = upper.elevationMm - expected;
        if (Math.abs(gap) > TOL) {
            add(
                ctx,
                gap > 0
                    ? 'SOLID_STOREY_STACK_GAP'
                    : 'SOLID_STOREY_STACK_OVERLAP',
                upper,
                [`level-${upper.level.toString()}`],
                `${upper.level.toString()}階の床高さ ${upper.elevationMm.toString()}mm が下階の上端 ${expected.toString()}mm と一致しません`,
                gap,
            );
        } else {
            ctx.allowed += 1; // upper slab bears on lower walls
        }
        const up = footprints.get(upper.level);
        const down = footprints.get(lower.level);
        if (
            up &&
            down &&
            (up.minX < down.minX - TOL ||
                up.maxX > down.maxX + TOL ||
                up.minY < down.minY - TOL ||
                up.maxY > down.maxY + TOL)
        ) {
            add(
                ctx,
                'SOLID_STOREY_UNSUPPORTED',
                upper,
                [`level-${upper.level.toString()}`],
                `${upper.level.toString()}階の外壁が下階の外形からはみ出しています（支持構造が未定義）`,
            );
        }
    }
}

export function checkStairs(floors: readonly Floor[], ctx: Ctx): void {
    for (const floor of floors) {
        for (const st of floor.stairs) {
            const target = floors.find((f) => f.level === st.upFloor);
            if (!target) {
                add(
                    ctx,
                    'SOLID_STAIR_UNCONNECTED',
                    floor,
                    [st.id],
                    `階段 ${st.id} の上階（${st.upFloor.toString()}階）がありません`,
                );
                continue;
            }
            const rise = target.elevationMm - floor.elevationMm;
            if (Math.abs(rise - floor.heightMm) > TOL) {
                add(
                    ctx,
                    'SOLID_STAIR_LEVEL_MISMATCH',
                    floor,
                    [st.id],
                    `階段 ${st.id} の昇り高さ ${rise.toString()}mm が階高 ${floor.heightMm.toString()}mm と一致しません`,
                    rise - floor.heightMm,
                );
            }
            const stairArea = polygonOverlapArea(st.polygon, st.polygon);
            const foot = floor.rooms.find((r) => r.type === 'stairs');
            const well = target.rooms.find((r) => r.type === 'stairs');
            const footArea = foot
                ? polygonOverlapArea(st.polygon, foot.polygon)
                : 0;
            const wellArea = well
                ? polygonOverlapArea(st.polygon, well.polygon)
                : 0;
            if (footArea < stairArea - AREA_TOL_MM2) {
                add(
                    ctx,
                    'SOLID_STAIR_OFF_SLAB',
                    floor,
                    [st.id],
                    `階段 ${st.id} が${floor.level.toString()}階の階段室の床に収まっていません`,
                );
            } else {
                ctx.allowed += 1; // stair foot on its floor
            }
            if (wellArea < stairArea - AREA_TOL_MM2) {
                add(
                    ctx,
                    'SOLID_STAIR_HITS_UPPER_SLAB',
                    target,
                    [st.id],
                    `階段 ${st.id} の上部に${target.level.toString()}階の吹抜け（階段室）がなく、上階の床と干渉します`,
                );
            } else {
                ctx.allowed += 1; // stair head lands in the upper stairwell
            }
        }
    }
}

export function checkRoof(
    model: BuildingModel,
    footprints: ReadonlyMap<number, Rect2 | null>,
    ctx: Ctx,
): void {
    const top = model.floors[model.floors.length - 1];
    if (!top) return;
    if (!top.walls.some((w) => w.kind === 'exterior')) {
        add(
            ctx,
            'SOLID_ROOF_UNSUPPORTED',
            top,
            ['roof'],
            '屋根を支える最上階の外壁がありません',
        );
        return;
    }
    if (footprints.get(top.level)) ctx.allowed += 1; // roof on the top-storey wall plate
}
