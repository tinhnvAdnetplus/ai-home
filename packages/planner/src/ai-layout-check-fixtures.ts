import { type AiLayout, type AiLayoutDoor } from './ai-layout-schema.js';
import { fixtureFootprintCells } from './fixture-catalog.js';

type AiLayoutFloor = AiLayout['floors'][number];
type AiLayoutRoomOf = AiLayoutFloor['rooms'][number];
type Rect = { x0: number; x1: number; y0: number; y1: number };

const isOverlappingRect = (a: Rect, b: Rect): boolean =>
    a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** A 1-cell clearance band along the door's swing/slide path, so furniture can't be placed
 * where it would block the opening — the same concern render3d's old `canPlaceBox` checked via a
 * clearance circle, now caught at the source instead of silently avoided downstream. */
function doorClearanceRects(doors: readonly AiLayoutDoor[]): Rect[] {
    return doors.map((d) =>
        d.dir === 'h'
            ? { x0: d.a, x1: d.b, y0: d.pos - 1, y1: d.pos + 1 }
            : { x0: d.pos - 1, x1: d.pos + 1, y0: d.a, y1: d.b },
    );
}

/** Furniture: must reference a real room, stay fully inside it, not overlap another item in the
 * same room, and not block a door's clearance path. Physical size per kind comes from the fixed
 * catalog, not from the AI. */
export function checkFloorFixtures(fl: AiLayoutFloor, tag: string): string[] {
    const errors: string[] = [];
    const byKey = new Map<string, AiLayoutRoomOf>(
        fl.rooms.map((r) => [r.key, r]),
    );
    const doorClearances = doorClearanceRects(fl.doors ?? []);
    const placed: {
        room: string;
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    }[] = [];

    for (const f of fl.fixtures ?? []) {
        const room = byKey.get(f.room);
        if (!room) {
            errors.push(
                `${tag} fixtures の room「${f.room}」に該当する部屋がありません。`,
            );
            continue;
        }
        const { wCells, hCells } = fixtureFootprintCells(f.kind, f.rotation);
        const x0 = f.x;
        const x1 = f.x + wCells;
        const y0 = f.y;
        const y1 = f.y + hCells;
        const isInside = room.rects.some(
            (rc) =>
                x0 >= rc.x &&
                x1 <= rc.x + rc.w &&
                y0 >= rc.y &&
                y1 <= rc.y + rc.h,
        );
        if (!isInside) {
            errors.push(
                `${tag}「${room.name}」の家具「${f.kind}」が部屋の外にはみ出しています。`,
            );
        }
        const fixtureRect: Rect = { x0, x1, y0, y1 };
        if (doorClearances.some((c) => isOverlappingRect(fixtureRect, c))) {
            errors.push(
                `${tag}「${room.name}」の家具「${f.kind}」がドアの開閉スペースを塞いでいます。`,
            );
        }
        for (const p of placed) {
            if (p.room !== f.room) continue;
            const isOverlapping = isOverlappingRect(fixtureRect, p);
            if (isOverlapping) {
                errors.push(
                    `${tag}「${room.name}」内で家具「${f.kind}」が他の家具と重なっています。`,
                );
            }
        }
        placed.push({ room: f.room, x0, x1, y0, y1 });
    }
    return errors;
}
