import { type AiLayout } from './ai-layout-schema.js';

type AiLayoutFloor = AiLayout['floors'][number];
type AiLayoutRoomOf = AiLayoutFloor['rooms'][number];

function isOnRoomPerimeter(
    room: AiLayoutRoomOf,
    dir: 'v' | 'h',
    pos: number,
    a: number,
    b: number,
    gridW: number,
    gridD: number,
): boolean {
    if (dir === 'h' && pos === 0) {
        return room.rects.some(
            (rc) =>
                rc.y === 0 && a >= rc.x - 0.01 && b <= rc.x + rc.w + 0.01,
        );
    }
    if (dir === 'h' && pos === gridD) {
        return room.rects.some(
            (rc) =>
                rc.y + rc.h === gridD &&
                a >= rc.x - 0.01 &&
                b <= rc.x + rc.w + 0.01,
        );
    }
    if (dir === 'v' && pos === 0) {
        return room.rects.some(
            (rc) =>
                rc.x === 0 && a >= rc.y - 0.01 && b <= rc.y + rc.h + 0.01,
        );
    }
    if (dir === 'v' && pos === gridW) {
        return room.rects.some(
            (rc) =>
                rc.x + rc.w === gridW &&
                a >= rc.y - 0.01 &&
                b <= rc.y + rc.h + 0.01,
        );
    }
    return false;
}

/** Validate AI-authored exterior windows on a floor's outer perimeter. */
export function checkFloorWindows(
    fl: AiLayoutFloor,
    gridW: number,
    tag: string,
): string[] {
    const errors: string[] = [];
    const byKey = new Map<string, AiLayoutRoomOf>(
        fl.rooms.map((r) => [r.key, r]),
    );
    const placed: { dir: 'v' | 'h'; pos: number; a: number; b: number }[] = [];

    for (const w of fl.windows ?? []) {
        const room = byKey.get(w.room);
        if (!room) {
            errors.push(
                `${tag} windows の room「${w.room}」に該当する部屋がありません。`,
            );
            continue;
        }
        if (w.a >= w.b) {
            errors.push(
                `${tag}「${room.name}」の窓座標が不正です(a<bにしてください)。`,
            );
            continue;
        }
        if (
            fl.level === 1 &&
            room.type === 'entrance' &&
            w.dir === 'h' &&
            w.pos === 0
        ) {
            errors.push(
                `${tag}「${room.name}」の道路側(y=0)には玄関ドアが入るため窓を置かないでください。`,
            );
            continue;
        }
        const isMatched = isOnRoomPerimeter(
            room,
            w.dir,
            w.pos,
            w.a,
            w.b,
            gridW,
            fl.gridD,
        );
        if (!isMatched) {
            errors.push(
                `${tag}「${room.name}」の窓(${w.dir},${w.pos.toString()},${w.a.toString()}-${w.b.toString()})が部屋の外周壁上にありません。`,
            );
            continue;
        }
        if (
            placed.some(
                (p) =>
                    p.dir === w.dir &&
                    p.pos === w.pos &&
                    w.a < p.b - 0.01 &&
                    w.b > p.a + 0.01,
            )
        ) {
            errors.push(
                `${tag}「${room.name}」の窓が同じ外壁上の別の窓と重なっています。`,
            );
        }
        placed.push({ dir: w.dir, pos: w.pos, a: w.a, b: w.b });
    }
    return errors;
}

/** Validate AI-authored exterior deck and trees so they stay outside the 1F footprint. */
export function checkAiExterior(layout: AiLayout): string[] {
    const errors: string[] = [];
    const ext = layout.exterior;
    if (!ext) return errors;
    const d1 = layout.floors[0]?.gridD ?? 0;
    const w = layout.gridW;

    if (ext.deck) {
        const dk = ext.deck;
        const isOverlappingHouse =
            dk.x < w && dk.x + dk.w > 0 && dk.y < d1 && dk.y + dk.h > 0;
        if (isOverlappingHouse) {
            errors.push(
                `exterior.deck(${dk.x.toString()},${dk.y.toString()},${dk.w.toString()},${dk.h.toString()})が1階の建物外形(0..${w.toString()}, 0..${d1.toString()})と重なっています。建物の外側に配置してください。`,
            );
        }
    }
    for (const t of ext.trees ?? []) {
        if (t.x >= 0 && t.x <= w && t.y >= 0 && t.y <= d1) {
            errors.push(
                `exterior.trees(${t.x.toString()},${t.y.toString()})が建物外形の内側にあります。庭エリア（建物の外側）に配置してください。`,
            );
        }
    }
    return errors;
}
