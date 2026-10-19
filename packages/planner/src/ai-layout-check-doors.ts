import { type AiLayout } from './ai-layout-schema.js';
import { edgesBetween, isStairsSideEdge } from './room-edges.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';

type AiLayoutFloor = AiLayout['floors'][number];
type AiLayoutRoomOf = AiLayoutFloor['rooms'][number];

/** Doors: each must sit on a real shared edge between its room and a neighbor, never on one of
 * the stairs' 3 non-landing sides (the bug this whole mechanism exists to catch). */
export function checkFloorDoors(
    fl: AiLayoutFloor,
    tag: string,
    shouldRequireDoors: boolean,
): string[] {
    const errors: string[] = [];
    const rooms = fl.rooms;
    const byKey = new Map<string, AiLayoutRoomOf>(rooms.map((r) => [r.key, r]));
    const doors = fl.doors ?? [];

    if (shouldRequireDoors) {
        const needsDoor = rooms.filter((r) => !OPEN_ROOM_TYPES.has(r.type));
        for (const r of needsDoor) {
            if (!doors.some((d) => d.room === r.key)) {
                errors.push(
                    `${tag}「${r.name}」にドア(doors)が指定されていません。`,
                );
            }
        }
    }

    for (const d of doors) {
        const room = byKey.get(d.room);
        if (!room) {
            errors.push(
                `${tag} doors の room「${d.room}」に該当する部屋がありません。`,
            );
            continue;
        }
        if (d.a >= d.b) {
            errors.push(
                `${tag}「${room.name}」のドア座標が不正です(a<bにしてください)。`,
            );
            continue;
        }
        let isMatched = false;
        for (const other of rooms) {
            if (other === room) continue;
            for (const e of edgesBetween(room, other)) {
                if (e.dir !== d.dir || e.pos !== d.pos) continue;
                if (d.a < e.a - 0.01 || d.b > e.b + 0.01) continue;
                isMatched = true;
                if (
                    isStairsSideEdge(room, d.dir, d.pos) ||
                    isStairsSideEdge(other, d.dir, d.pos)
                ) {
                    errors.push(
                        `${tag}「${room.name}」のドアが階段の側面（踊り場でない辺）にあります。階段の出入口は y の大きい側の短辺のみです。`,
                    );
                }
            }
        }
        if (!isMatched) {
            errors.push(
                `${tag}「${room.name}」のドア(${d.dir},${d.pos.toString()},${d.a.toString()}-${d.b.toString()})に隣接する部屋の境界がありません。`,
            );
        }
    }
    return errors;
}
