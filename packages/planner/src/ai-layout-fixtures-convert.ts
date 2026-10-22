import {
    type Fixture,
    EXTERIOR_WALL_THICKNESS_MM,
    INTERIOR_WALL_THICKNESS_MM,
} from '@aihome/bdm';
import { type AiLayoutFixture, type AiLayoutRoom } from './ai-layout-schema.js';
import {
    fixtureFootprintCells,
    fixtureFootprintMm,
} from './fixture-catalog.js';

/** Clear gap kept between a fixture and the face of a wall it stands against. */
export const FIXTURE_WALL_GAP_MM = 10;

export type AiFixtureWallContext = {
    readonly rooms: readonly AiLayoutRoom[];
    readonly gridW: number;
    readonly gridD: number;
};

type Cells = {
    readonly x0: number;
    readonly x1: number;
    readonly y0: number;
    readonly y1: number;
};

/** Does the grid line `pos` (on axis `dir`) bound the room along [a, b) — i.e. is a wall there? */
function isRoomBoundary(
    room: AiLayoutRoom,
    dir: 'x' | 'y',
    pos: number,
    a: number,
    b: number,
): boolean {
    const owns = (cx: number, cy: number): boolean =>
        room.rects.some(
            (rc) =>
                cx >= rc.x &&
                cx < rc.x + rc.w &&
                cy >= rc.y &&
                cy < rc.y + rc.h,
        );
    for (let t = a; t < b; t += 1) {
        const isInside = dir === 'x' ? owns(pos, t) : owns(t, pos);
        const isOutside = dir === 'x' ? owns(pos - 1, t) : owns(t, pos - 1);
        if (isInside !== isOutside) return true;
    }
    return false;
}

/**
 * Place the item's real (catalog) footprint inside the cell box the AI chose. Grid lines are
 * wall CENTRELINES, so an item flush with a cell line that bounds its room would sit half a wall
 * thickness inside that wall. Per axis: an item whose cell box touches a wall on one side is
 * backed against that wall's face (+ a small gap); touching walls on both sides it is centred;
 * touching none it stays exactly where the AI put it. The item never leaves its own cell box,
 * so the room-containment / overlap / door-clearance checks already passed on that box still
 * hold. When the box is too small to clear the wall the item is left flush and the solid
 * validator reports the penetration instead of hiding it.
 */
function placeAlongAxis(
    cellLo: number,
    cellHi: number,
    sizeMm: number,
    gridMm: number,
    loClear: number | null,
    hiClear: number | null,
): number {
    const lo = cellLo * gridMm;
    const hi = cellHi * gridMm;
    if (loClear !== null && hiClear !== null) {
        const room = hi - lo - loClear - hiClear;
        return room >= sizeMm ? lo + loClear + (room - sizeMm) / 2 : lo;
    }
    if (loClear !== null)
        return hi - lo - sizeMm >= loClear ? lo + loClear : lo;
    if (hiClear !== null)
        return hi - lo - sizeMm >= hiClear ? hi - hiClear - sizeMm : lo;
    return lo;
}

function clearanceFor(isWall: boolean, isOutline: boolean): number | null {
    if (!isWall) return null;
    const thickness = isOutline
        ? EXTERIOR_WALL_THICKNESS_MM
        : INTERIOR_WALL_THICKNESS_MM;
    return thickness / 2 + FIXTURE_WALL_GAP_MM;
}

function wallAwarePos(
    f: AiLayoutFixture,
    gridMm: number,
    ctx: AiFixtureWallContext,
): { x: number; y: number } {
    const room = ctx.rooms.find((r) => r.key === f.room);
    const { wCells, hCells } = fixtureFootprintCells(
        f.kind,
        f.rotation,
        gridMm,
    );
    const size = fixtureFootprintMm(f.kind, f.rotation);
    const c: Cells = { x0: f.x, x1: f.x + wCells, y0: f.y, y1: f.y + hCells };
    if (!room) return { x: c.x0 * gridMm, y: c.y0 * gridMm };
    const xLo = clearanceFor(
        isRoomBoundary(room, 'x', c.x0, c.y0, c.y1),
        c.x0 === 0,
    );
    const xHi = clearanceFor(
        isRoomBoundary(room, 'x', c.x1, c.y0, c.y1),
        c.x1 === ctx.gridW,
    );
    const yLo = clearanceFor(
        isRoomBoundary(room, 'y', c.y0, c.x0, c.x1),
        c.y0 === 0,
    );
    const yHi = clearanceFor(
        isRoomBoundary(room, 'y', c.y1, c.x0, c.x1),
        c.y1 === ctx.gridD,
    );
    return {
        x: Math.round(
            placeAlongAxis(c.x0, c.x1, size.widthMm, gridMm, xLo, xHi),
        ),
        y: Math.round(
            placeAlongAxis(c.y0, c.y1, size.heightMm, gridMm, yLo, yHi),
        ),
    };
}

/** Grid units (same axes as `rects`) to the BDM `Fixture` shape (mm). The AI picks kind +
 * position + rotation; the item's physical size comes from the fixed catalog, not from here.
 * With `wallContext` the item is backed against the face of the wall it stands at (see
 * `placeAlongAxis`); without it the grid corner is used verbatim. */
export function convertAiFixtures(
    level: number,
    fixtures: readonly AiLayoutFixture[],
    gridMm: number,
    wallContext?: AiFixtureWallContext,
): Fixture[] {
    return fixtures.map((f, i) => ({
        id: `fix-ai-${level.toString()}-${i.toString()}`,
        kind: f.kind,
        pos: wallContext
            ? wallAwarePos(f, gridMm, wallContext)
            : { x: Math.round(f.x * gridMm), y: Math.round(f.y * gridMm) },
        rotation: f.rotation,
    }));
}
