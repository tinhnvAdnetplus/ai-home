import {
    type AiLayout,
    type AiLayoutDoor,
    type AiLayoutFixture,
    type AiLayoutRoom,
} from './ai-layout-schema.js';
import { fixtureFootprintCells } from './fixture-catalog.js';

type AiLayoutFloor = AiLayout['floors'][number];

/** A half-open cell box: covers cells x0..x1-1 × y0..y1-1. */
export type CellRect = { x0: number; x1: number; y0: number; y1: number };

export const isOverlappingRect = (a: CellRect, b: CellRect): boolean =>
    a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** A 1-cell clearance band along the door's swing/slide path, so furniture can't be placed
 * where it would block the opening — the same concern render3d's old `canPlaceBox` checked via a
 * clearance circle, now caught at the source instead of silently avoided downstream. */
export function doorClearanceRects(doors: readonly AiLayoutDoor[]): CellRect[] {
    return doors.map((d) =>
        d.dir === 'h'
            ? { x0: d.a, x1: d.b, y0: d.pos - 1, y1: d.pos + 1 }
            : { x0: d.pos - 1, x1: d.pos + 1, y0: d.a, y1: d.b },
    );
}

/** The cells a fixture occupies: its catalog footprint rounded up to whole cells, at x,y. */
export function fixtureCellRect(f: AiLayoutFixture): CellRect {
    const { wCells, hCells } = fixtureFootprintCells(f.kind, f.rotation);
    return { x0: f.x, x1: f.x + wCells, y0: f.y, y1: f.y + hCells };
}

/** Fully inside one of the room's rects (a box straddling two rects of an L-shaped room is not). */
export function isInsideOneRect(room: AiLayoutRoom, box: CellRect): boolean {
    return room.rects.some(
        (rc) =>
            box.x0 >= rc.x &&
            box.x1 <= rc.x + rc.w &&
            box.y0 >= rc.y &&
            box.y1 <= rc.y + rc.h,
    );
}

/** Furniture: must reference a real room, stay fully inside it, not overlap another item in the
 * same room, and not block a door's clearance path. Physical size per kind comes from the fixed
 * catalog, not from the AI. */
export function checkFloorFixtures(fl: AiLayoutFloor, tag: string): string[] {
    const errors: string[] = [];
    const byKey = new Map<string, AiLayoutRoom>(
        fl.rooms.map((r) => [r.key, r]),
    );
    const doorClearances = doorClearanceRects(fl.doors ?? []);
    const placed: (CellRect & { room: string })[] = [];

    for (const f of fl.fixtures ?? []) {
        const room = byKey.get(f.room);
        if (!room) {
            errors.push(
                `${tag} fixtures の room「${f.room}」に該当する部屋がありません。`,
            );
            continue;
        }
        const fixtureRect = fixtureCellRect(f);
        if (!isInsideOneRect(room, fixtureRect)) {
            errors.push(
                `${tag}「${room.name}」の家具「${f.kind}」が部屋の外にはみ出しています。`,
            );
        }
        if (doorClearances.some((c) => isOverlappingRect(fixtureRect, c))) {
            errors.push(
                `${tag}「${room.name}」の家具「${f.kind}」がドアの開閉スペースを塞いでいます。`,
            );
        }
        for (const p of placed) {
            if (p.room !== f.room) continue;
            if (isOverlappingRect(fixtureRect, p)) {
                errors.push(
                    `${tag}「${room.name}」内で家具「${f.kind}」が他の家具と重なっています。`,
                );
            }
        }
        placed.push({ room: f.room, ...fixtureRect });
    }
    return errors;
}
