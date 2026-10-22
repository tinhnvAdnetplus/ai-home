import {
    type Fixture,
    type Point,
    EXTERIOR_WALL_THICKNESS_MM,
} from '@aihome/bdm';
import {
    fixtureFootprintMm,
    isFixtureKind,
    normalizeFixtureRotation,
} from './fixture-catalog.js';
import { type GridRoom } from './types.js';

export type Box = {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
};

/** Clearance from a room's centreline edge to keep an item off the wall solid (worst case:
 * exterior wall half-thickness) plus a small gap. */
export const WALL_CLEAR_MM = EXTERIOR_WALL_THICKNESS_MM / 2 + 10;
/** Gap kept between two generated items. */
export const ITEM_GAP_MM = 20;

export function pt(x: number, y: number): Point {
    return { x: Math.round(x), y: Math.round(y) };
}

export function footprint(f: Fixture): Box | null {
    if (!isFixtureKind(f.kind)) return null;
    const s = fixtureFootprintMm(f.kind, normalizeFixtureRotation(f.rotation));
    return {
        minX: f.pos.x,
        maxX: f.pos.x + s.widthMm,
        minY: f.pos.y,
        maxY: f.pos.y + s.heightMm,
    };
}

/** Clear (wall-free) boxes of a room: each rect inset by the wall clearance. */
export function clearBoxes(r: GridRoom, gridMm: number): Box[] {
    return r.rects.map((rc) => ({
        minX: rc.x * gridMm + WALL_CLEAR_MM,
        maxX: (rc.x + rc.w) * gridMm - WALL_CLEAR_MM,
        minY: rc.y * gridMm + WALL_CLEAR_MM,
        maxY: (rc.y + rc.h) * gridMm - WALL_CLEAR_MM,
    }));
}

const inside = (a: Box, b: Box): boolean =>
    a.minX >= b.minX &&
    a.maxX <= b.maxX &&
    a.minY >= b.minY &&
    a.maxY <= b.maxY;

const overlaps = (a: Box, b: Box): boolean =>
    a.minX < b.maxX + ITEM_GAP_MM &&
    a.maxX > b.minX - ITEM_GAP_MM &&
    a.minY < b.maxY + ITEM_GAP_MM &&
    a.maxY > b.minY - ITEM_GAP_MM;

export type RoomCtx = {
    /** Wall-free boxes of the room (its rects inset by the wall clearance). */
    readonly clear: readonly Box[];
    /** Footprints already placed in the room. */
    readonly placed: Box[];
    /** Door swing / passage zones of the floor. */
    readonly keepClear: readonly Box[];
};

/** Fallback positions: the four corners of each clear box. */
export function cornerCandidates(
    fixture: Omit<Fixture, 'pos'>,
    clear: readonly Box[],
): Point[] {
    const probe = footprint({ ...fixture, pos: { x: 0, y: 0 } });
    if (!probe) return [];
    const w = probe.maxX;
    const h = probe.maxY;
    return clear.flatMap((c) => [
        { x: c.minX, y: c.minY },
        { x: c.maxX - w, y: c.minY },
        { x: c.minX, y: c.maxY - h },
        { x: c.maxX - w, y: c.maxY - h },
    ]);
}

/**
 * Accept the first candidate position whose real footprint stays inside one clear box of the
 * room (so it never crosses a wall, including the walls of rooms carved out of an L-shaped
 * room's bounding box), keeps clear of the items already placed and, if at all possible, of
 * door swing zones. The first candidate is the historical position, so rooms that were already
 * valid are unchanged; when every candidate is in a door zone the first wall-safe one is kept
 * (the solid validator then reports the obstruction) rather than silently dropping the item.
 */
export function placeFirstFree(
    fixture: Omit<Fixture, 'pos'>,
    preferred: readonly Point[],
    room: RoomCtx,
): Fixture | null {
    const candidates = [...preferred, ...cornerCandidates(fixture, room.clear)];
    let fallback: { f: Fixture; box: Box } | null = null;
    for (const pos of candidates) {
        const f: Fixture = { ...fixture, pos: pt(pos.x, pos.y) };
        const box = footprint(f);
        if (!box) return f;
        if (!room.clear.some((c) => inside(box, c))) continue;
        if (room.placed.some((p) => overlaps(box, p))) continue;
        if (room.keepClear.some((z) => overlaps(box, z))) {
            fallback ??= { f, box };
            continue;
        }
        room.placed.push(box);
        return f;
    }
    if (!fallback) return null;
    room.placed.push(fallback.box);
    return fallback.f;
}

/** Same as `placeFirstFree`, retrying an already-computed position clamped into each clear box. */
export function fitIntoRoom(fixture: Fixture, room: RoomCtx): Fixture | null {
    const box = footprint(fixture);
    if (!box) return fixture;
    const w = box.maxX - box.minX;
    const h = box.maxY - box.minY;
    const clamped = room.clear
        .filter((c) => c.maxX - c.minX >= w && c.maxY - c.minY >= h)
        .map((c) => ({
            x: Math.min(Math.max(fixture.pos.x, c.minX), c.maxX - w),
            y: Math.min(Math.max(fixture.pos.y, c.minY), c.maxY - h),
        }));
    return placeFirstFree(fixture, [fixture.pos, ...clamped], room);
}
