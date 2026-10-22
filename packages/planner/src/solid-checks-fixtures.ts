import {
    type Floor,
    type Rect2,
    isPointInPolygon,
    rectAreaOutsidePolygon,
    rectOverlapArea,
    rectOverlapDepth,
} from '@aihome/bdm';
import {
    fixtureFootprintMm,
    isFixtureKind,
    normalizeFixtureRotation,
} from './fixture-catalog.js';
import {
    type Ctx,
    type FixtureSolid,
    AREA_TOL_MM2,
    TOL,
    add,
    label,
    openingRect,
} from './solid-context.js';
import { doorClearZone, isDoorKind } from './solid-door-zone.js';

function fixtureSolids(floor: Floor, ctx: Ctx): FixtureSolid[] {
    const out: FixtureSolid[] = [];
    for (const f of floor.fixtures) {
        if (!isFixtureKind(f.kind)) {
            ctx.incomplete.add(
                `家具「${f.kind}」(${f.id}) は寸法が不明のため干渉判定できません。`,
            );
            continue;
        }
        const size = fixtureFootprintMm(
            f.kind,
            normalizeFixtureRotation(f.rotation),
        );
        out.push({
            id: f.id,
            kind: f.kind,
            rect: {
                minX: f.pos.x,
                maxX: f.pos.x + size.widthMm,
                minY: f.pos.y,
                maxY: f.pos.y + size.heightMm,
            },
        });
    }
    return out;
}

export function checkFixtures(
    floor: Floor,
    solids: ReadonlyMap<string, Rect2>,
    ctx: Ctx,
): void {
    const items = fixtureSolids(floor, ctx);
    if (items.length === 0) return;
    const wallById = new Map(floor.walls.map((w) => [w.id, w]));
    const doorZones = floor.openings
        .filter(isDoorKind)
        .map((op) => {
            const w = wallById.get(op.wallId);
            const zone = w ? doorClearZone(w, op, floor) : null;
            const slot = w ? openingRect(w, op) : null;
            return zone && slot ? { op, zone, slot } : null;
        })
        .filter((z): z is NonNullable<typeof z> => z !== null);

    for (const [i, it] of items.entries()) {
        const cx = (it.rect.minX + it.rect.maxX) / 2;
        const cy = (it.rect.minY + it.rect.maxY) / 2;
        const room = floor.rooms.find((r) =>
            isPointInPolygon(cx, cy, r.polygon),
        );
        const hostName = room ? `「${room.name}」の` : '';
        if (!room) {
            add(
                ctx,
                'SOLID_FIXTURE_NO_HOST',
                floor,
                [it.id],
                `${label(it.kind)}（${it.id}）の中心がどの部屋にもありません`,
            );
        } else if (
            rectAreaOutsidePolygon(it.rect, room.polygon) > AREA_TOL_MM2
        ) {
            add(
                ctx,
                'SOLID_FIXTURE_OUTSIDE_HOST',
                floor,
                [it.id, room.id],
                `「${room.name}」の${label(it.kind)}が部屋からはみ出しています`,
            );
        }

        for (const [wallId, r] of solids) {
            const depth = rectOverlapDepth(it.rect, r);
            if (depth <= TOL) continue;
            // Inside a floor-level door slot the wall is absent: that is an obstruction, not a
            // penetration. Under a window the wall below the sill still exists.
            const isInDoorSlot = doorZones.some(
                (z) =>
                    z.op.wallId === wallId &&
                    z.op.sillMm <= TOL &&
                    rectOverlapDepth(it.rect, z.slot) > TOL,
            );
            if (isInDoorSlot) continue;
            add(
                ctx,
                'SOLID_FIXTURE_WALL_PENETRATION',
                floor,
                [it.id, wallId],
                `${hostName}${label(it.kind)}が壁に${Math.round(depth).toString()}mmめり込んでいます`,
                depth,
            );
        }

        for (const other of items.slice(i + 1)) {
            const depth = rectOverlapDepth(it.rect, other.rect);
            if (depth > TOL) {
                add(
                    ctx,
                    'SOLID_FIXTURE_OVERLAP',
                    floor,
                    [it.id, other.id],
                    `${hostName}${label(it.kind)}と${label(other.kind)}が重なっています`,
                    depth,
                );
            }
        }

        for (const z of doorZones) {
            if (rectOverlapArea(it.rect, z.zone) > AREA_TOL_MM2) {
                add(
                    ctx,
                    'SOLID_FIXTURE_IN_DOOR_ZONE',
                    floor,
                    [it.id, z.op.id],
                    `${hostName}${label(it.kind)}がドアの開閉・通行範囲にかかっている可能性があります（開き勝手は推定）`,
                );
            }
        }
    }
    ctx.incomplete.add(
        '家具の高さはBDMに無いため、天井・窓の腰高・壁付け器具との上下方向のクリアランスは未検証です。',
    );
}
