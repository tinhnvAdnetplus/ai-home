import { type Wall, type Opening } from '@aihome/bdm';
import { type DoorSpec } from './circulation.js';
import { type WindowSpec } from './openings.js';
import { buildInteriorWalls } from './interior-walls.js';
import { type GridRoom } from './types.js';

export type FloorWallsAndOpenings = {
    readonly walls: readonly Wall[];
    readonly openings: readonly Opening[];
};

export function buildWallsAndOpenings(
    level: number,
    W: number,
    D: number,
    gridMm: number,
    doors: readonly DoorSpec[],
    windows: readonly WindowSpec[],
    rooms: readonly GridRoom[] = [],
): FloorWallsAndOpenings {
    const walls: Wall[] = [];
    const openings: Opening[] = [];

    const wallFrontId = `wall-${level.toString()}-front`;
    const wallRightId = `wall-${level.toString()}-right`;
    const wallBackId = `wall-${level.toString()}-back`;
    const wallLeftId = `wall-${level.toString()}-left`;

    walls.push(
        {
            id: wallFrontId,
            a: { x: 0, y: 0 },
            b: { x: W * gridMm, y: 0 },
            thicknessMm: 150,
            kind: 'exterior',
        },
        {
            id: wallRightId,
            a: { x: W * gridMm, y: 0 },
            b: { x: W * gridMm, y: D * gridMm },
            thicknessMm: 150,
            kind: 'exterior',
        },
        {
            id: wallBackId,
            a: { x: 0, y: D * gridMm },
            b: { x: W * gridMm, y: D * gridMm },
            thicknessMm: 150,
            kind: 'exterior',
        },
        {
            id: wallLeftId,
            a: { x: 0, y: 0 },
            b: { x: 0, y: D * gridMm },
            thicknessMm: 150,
            kind: 'exterior',
        },
    );

    let opSeq = 0;
    for (const win of windows) {
        let wallId = wallFrontId;
        if (win.dir === 'h' && win.pos === D) wallId = wallBackId;
        else if (win.dir === 'v' && win.pos === 0) wallId = wallLeftId;
        else if (win.dir === 'v' && win.pos === W) wallId = wallRightId;

        const offsetMm = Math.round(win.a * gridMm);
        const widthMm = Math.max(600, Math.round((win.b - win.a) * gridMm));

        openings.push({
            id: `open-${level.toString()}-${(opSeq++).toString()}`,
            wallId,
            offsetMm,
            widthMm,
            heightMm: win.isBig ? 2000 : 900,
            sillMm: win.isBig ? 0 : 900,
            kind:
                win.kind === 'sash'
                    ? 'largeWindow'
                    : win.isBig
                      ? 'window'
                      : 'window',
        });
    }

    const interior = buildInteriorWalls(
        level,
        rooms,
        doors,
        W,
        D,
        gridMm,
        opSeq,
    );
    walls.push(...interior.walls);
    openings.push(...interior.openings);

    if (level === 1) {
        const entryRoom = rooms.find((r) => r.type === 'entrance');
        const entryRc = entryRoom?.rects[0];
        let entOffset = Math.round((W * gridMm) / 4);
        if (entryRc) {
            entOffset = Math.round(
                entryRc.x * gridMm + (entryRc.w * gridMm - 900) / 2,
            );
        }
        entOffset = Math.max(0, Math.min(W * gridMm - 900, entOffset));
        openings.push({
            id: `open-1-main-entrance`,
            wallId: wallFrontId,
            offsetMm: entOffset,
            widthMm: 900,
            heightMm: 2100,
            sillMm: 0,
            kind: 'entrance',
        });
    }

    return { walls, openings };
}
