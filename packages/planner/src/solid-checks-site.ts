import {
    type BuildingModel,
    type Rect2,
    rectOfPolygon,
    rectOverlapArea,
} from '@aihome/bdm';
import { type Ctx, AREA_TOL_MM2, TOL, add } from './solid-context.js';

export function checkSite(
    model: BuildingModel,
    ground: Rect2 | null,
    centreline: Rect2 | null,
    ctx: Ctx,
): void {
    const floor1 = model.floors[0] ?? null;
    if (!ground || !centreline) return;
    for (const [i, t] of (model.exterior?.trees ?? []).entries()) {
        const nx = Math.max(ground.minX, Math.min(t.pos.x, ground.maxX));
        const ny = Math.max(ground.minY, Math.min(t.pos.y, ground.maxY));
        const dist = Math.hypot(t.pos.x - nx, t.pos.y - ny);
        if (dist < t.radiusMm - TOL) {
            add(
                ctx,
                'SOLID_SITE_TREE_HITS_BUILDING',
                floor1,
                [`tree-${i.toString()}`],
                `庭木 ${i.toString()} の樹冠が建物の外壁にかかっています`,
                t.radiusMm - dist,
            );
        }
    }
    if ((model.exterior?.trees ?? []).length > 0) {
        ctx.incomplete.add(
            '樹高はBDMに無いため、庭木と軒・屋根の上下方向の干渉は未検証です。',
        );
    }
    // Deck and approach may be fixed to the outer half of an exterior wall (allowed attachment);
    // reaching past the wall centreline puts them inside the building.
    const attached: [string, ReturnType<typeof rectOfPolygon> | null][] = [
        [
            'SOLID_SITE_DECK_OVERLAPS_BUILDING',
            model.exterior?.deckPolygon
                ? rectOfPolygon(model.exterior.deckPolygon)
                : null,
        ],
        [
            'SOLID_SITE_APPROACH_OVERLAPS_BUILDING',
            model.exterior?.approachPolygon
                ? rectOfPolygon(model.exterior.approachPolygon)
                : null,
        ],
    ];
    for (const [code, r] of attached) {
        if (!r) continue;
        if (rectOverlapArea(r, centreline) > AREA_TOL_MM2) {
            add(
                ctx,
                code,
                floor1,
                [code.includes('DECK') ? 'deck' : 'approach'],
                'ウッドデッキ／アプローチが建物の内側に入り込んでいます',
            );
        } else if (rectOverlapArea(r, ground) > 0) {
            ctx.allowed += 1;
        }
    }
    const pad = model.parking.polygon
        ? rectOfPolygon(model.parking.polygon)
        : null;
    if (pad && rectOverlapArea(pad, ground) > AREA_TOL_MM2) {
        add(
            ctx,
            'SOLID_SITE_CARPAD_OVERLAPS_BUILDING',
            floor1,
            ['parking'],
            '駐車スペースが建物と重なっています',
        );
    }
}
