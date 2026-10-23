import {
    type AiLayout,
    type AiLayoutFixture,
    type AiLayoutRoom,
} from './ai-layout-schema.js';
import {
    type CellRect,
    doorClearanceRects,
    fixtureCellRect,
    isInsideOneRect,
    isOverlappingRect,
} from './ai-layout-check-fixtures.js';
import { type FixtureKind, type FixtureRotation } from './fixture-catalog.js';

type AiLayoutFloor = AiLayout['floors'][number];

/** Smaller stand-in tried when an item fits nowhere in its room in either orientation. */
const SMALLER_KIND: Partial<Record<FixtureKind, FixtureKind>> = {
    dining_table_6: 'dining_table_4',
    sofa_l: 'sofa',
    kitchen_l: 'kitchen_counter',
    bed_double: 'bed_single',
};

export type FixtureFitAction = 'moved' | 'rotated' | 'downsized' | 'dropped';

export type FixtureFitChange = {
    readonly level: number;
    readonly room: string;
    readonly kind: FixtureKind;
    readonly action: FixtureFitAction;
};

const quarterTurn = (r: FixtureRotation): FixtureRotation =>
    r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0;

const area = (f: AiLayoutFixture): number => {
    const b = fixtureCellRect(f);
    return (b.x1 - b.x0) * (b.y1 - b.y0);
};

/** Every placement of `kind`/`rotation` inside the room's rects, nearest to the AI's own choice
 * first; at equal distance an item backed against its rect's edge (a wall) wins. */
function candidates(
    room: AiLayoutRoom,
    orig: AiLayoutFixture,
    kind: FixtureKind,
    rotation: FixtureRotation,
): AiLayoutFixture[] {
    const out: { f: AiLayoutFixture; score: number }[] = [];
    for (const rc of room.rects) {
        const probe = fixtureCellRect({ ...orig, kind, rotation, x: 0, y: 0 });
        for (let y = rc.y; y + probe.y1 <= rc.y + rc.h; y += 1) {
            for (let x = rc.x; x + probe.x1 <= rc.x + rc.w; x += 1) {
                const isAgainstWall =
                    x === rc.x ||
                    y === rc.y ||
                    x + probe.x1 === rc.x + rc.w ||
                    y + probe.y1 === rc.y + rc.h;
                const dist = Math.abs(x - orig.x) + Math.abs(y - orig.y);
                const score = dist * 2 + (isAgainstWall ? 0 : 1);
                out.push({ f: { ...orig, kind, rotation, x, y }, score });
            }
        }
    }
    return out.sort((a, b) => a.score - b.score).map((c) => c.f);
}

/** Shift, then turn a quarter, then a smaller kind; null when nothing fits (the item is dropped). */
function findPlacement(
    room: AiLayoutRoom,
    f: AiLayoutFixture,
    isFree: (box: CellRect) => boolean,
): AiLayoutFixture | null {
    const smaller = SMALLER_KIND[f.kind];
    const kinds = smaller ? [f.kind, smaller] : [f.kind];
    for (const kind of kinds) {
        for (const rotation of [f.rotation, quarterTurn(f.rotation)]) {
            const hit = candidates(room, f, kind, rotation).find((c) =>
                isFree(fixtureCellRect(c)),
            );
            if (hit) return hit;
        }
    }
    return null;
}

function actionOf(
    from: AiLayoutFixture,
    to: AiLayoutFixture | null,
): FixtureFitAction | null {
    if (!to) return 'dropped';
    if (to.kind !== from.kind) return 'downsized';
    if (to.rotation !== from.rotation) return 'rotated';
    return to.x !== from.x || to.y !== from.y ? 'moved' : null;
}

function fitFloor(fl: AiLayoutFloor): {
    fixtures: AiLayoutFixture[];
    changes: FixtureFitChange[];
} {
    const rooms = new Map(fl.rooms.map((r) => [r.key, r]));
    const clearances = doorClearanceRects(fl.doors ?? []);
    const taken = new Map<string, CellRect[]>();
    const original = fl.fixtures ?? [];
    const fitted = new Map<number, AiLayoutFixture | null>();
    const order = original
        .map((f, i) => ({ f, i }))
        .sort((a, b) => area(b.f) - area(a.f) || a.i - b.i);

    for (const { f, i } of order) {
        const room = rooms.get(f.room);
        const boxes = taken.get(f.room) ?? [];
        const isFree = (box: CellRect): boolean =>
            room !== undefined &&
            isInsideOneRect(room, box) &&
            !clearances.some((c) => isOverlappingRect(box, c)) &&
            !boxes.some((b) => isOverlappingRect(box, b));
        const placed = room ? findPlacement(room, f, isFree) : null;
        if (placed) taken.set(f.room, [...boxes, fixtureCellRect(placed)]);
        fitted.set(i, placed);
    }

    const changes: FixtureFitChange[] = [];
    const fixtures: AiLayoutFixture[] = [];
    original.forEach((f, i) => {
        const to = fitted.get(i) ?? null;
        const action = actionOf(f, to);
        if (action)
            changes.push({
                level: fl.level,
                room: f.room,
                kind: f.kind,
                action,
            });
        if (to) fixtures.push(to);
    });
    return { fixtures, changes };
}

/**
 * Deterministic furniture pass over an AI layout: per room it takes the free cells (the room's
 * cells minus every door clearance band and the items already placed, largest item first) and
 * keeps each item where the AI put it if it fits there; otherwise it shifts it to the nearest
 * free spot, turns it a quarter, swaps in a smaller kind, or drops it. The result always passes
 * `checkFloorFixtures`, so the AI is only asked to fix rooms and doors.
 */
export function fitAiLayoutFixtures(layout: AiLayout): {
    layout: AiLayout;
    changes: FixtureFitChange[];
} {
    const changes: FixtureFitChange[] = [];
    const floors = layout.floors.map((fl) => {
        if (!fl.fixtures) return fl;
        const res = fitFloor(fl);
        changes.push(...res.changes);
        return { ...fl, fixtures: res.fixtures };
    });
    return { layout: { ...layout, floors }, changes };
}
