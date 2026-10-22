import {
    type Floor,
    type Opening,
    type Rect2,
    type Wall,
    isPointInPolygon,
    wallThicknessMm,
} from '@aihome/bdm';
import { OPEN_ROOM_TYPES } from './room-kinds.js';
import {
    MAX_SWING_DEPTH_MM,
    SLIDING_DOOR_CLEAR_DEPTH_MM,
    TOL,
    openingRect,
} from './solid-context.js';

/**
 * Zone that must stay clear at a door. Sliding doors: a shallow strip on both sides. Swing
 * doors: the leaf sweeps a square of its own width; the swing side is not stored in the BDM,
 * so the usual Japanese convention is assumed — a door between a room and circulation
 * (hall/corridor/entrance/stairs/LDK) swings INTO the room; an entrance door swings outward
 * (the side with no room); anything else is checked on both sides.
 */
export function doorClearZone(
    wall: Wall,
    op: Opening,
    floor: Pick<Floor, 'rooms'>,
): Rect2 | null {
    const slot = openingRect(wall, op);
    if (!slot) return null;
    const isHorizontal = Math.abs(wall.a.y - wall.b.y) <= TOL;
    const fixed = isHorizontal ? wall.a.y : wall.a.x;
    const zone = (lo: number, hi: number): Rect2 =>
        isHorizontal
            ? { ...slot, minY: fixed + lo, maxY: fixed + hi }
            : { ...slot, minX: fixed + lo, maxX: fixed + hi };
    if (op.kind === 'slidingDoor') {
        return zone(-SLIDING_DOOR_CLEAR_DEPTH_MM, SLIDING_DOOR_CLEAR_DEPTH_MM);
    }
    const depth = Math.min(op.widthMm, MAX_SWING_DEPTH_MM);
    const along = isHorizontal
        ? (slot.minX + slot.maxX) / 2
        : (slot.minY + slot.maxY) / 2;
    const probe = wallThicknessMm(wall) / 2 + 2 * TOL;
    const roomAt = (side: 1 | -1): string | null => {
        const x = isHorizontal ? along : fixed + side * probe;
        const y = isHorizontal ? fixed + side * probe : along;
        return (
            floor.rooms.find((r) => isPointInPolygon(x, y, r.polygon))?.type ??
            null
        );
    };
    const neg = roomAt(-1);
    const pos = roomAt(1);
    const swingsTo = (side: 1 | -1): Rect2 =>
        side > 0 ? zone(0, depth) : zone(-depth, 0);
    if (op.kind === 'entrance' || neg === null || pos === null) {
        if (neg === null && pos !== null) return swingsTo(-1);
        if (pos === null && neg !== null) return swingsTo(1);
    }
    const isNegOpen = neg !== null && OPEN_ROOM_TYPES.has(neg);
    const isPosOpen = pos !== null && OPEN_ROOM_TYPES.has(pos);
    if (isNegOpen && !isPosOpen) return swingsTo(1);
    if (isPosOpen && !isNegOpen) return swingsTo(-1);
    return zone(-depth, depth);
}

export const isDoorKind = (op: Opening): boolean =>
    op.kind === 'door' || op.kind === 'slidingDoor' || op.kind === 'entrance';
