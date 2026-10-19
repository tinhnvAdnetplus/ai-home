import { type DoorSpec } from './circulation.js';
import { type AiLayoutDoor, type AiLayoutRoom } from './ai-layout-schema.js';
import { containsPoint } from './room-edges.js';

/** Turn the AI's own door choices into the same `DoorSpec` shape `buildDoors` produces, so the
 * rest of the wall/opening pipeline needs no changes. `name`/`side` are geometric facts (not a
 * design decision), so code derives them instead of asking the AI for more numbers. */
export function convertAiDoors(
    rooms: readonly AiLayoutRoom[],
    doors: readonly AiLayoutDoor[],
): DoorSpec[] {
    const byKey = new Map(rooms.map((r) => [r.key, r]));
    const specs: DoorSpec[] = [];
    for (const d of doors) {
        const room = byKey.get(d.room);
        // checkAiLayout already reports an unknown room key; skip it defensively here.
        if (!room) continue;
        const mid = (d.a + d.b) / 2;
        const side =
            d.dir === 'v'
                ? containsPoint(room, d.pos, Math.floor(mid))
                    ? 1
                    : -1
                : containsPoint(room, Math.floor(mid), d.pos)
                  ? 1
                  : -1;
        specs.push({
            dir: d.dir,
            pos: d.pos,
            a: d.a,
            b: d.b,
            kind: d.kind,
            room: room.key,
            name: room.name,
            side,
        });
    }
    return specs;
}
