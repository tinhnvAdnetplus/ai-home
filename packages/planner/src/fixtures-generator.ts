import { type Fixture } from '@aihome/bdm';
import { type GridRoom, type PlanInput } from './types.js';
import { generateLdkFixtures } from './fixtures-ldk.js';
import {
    type Box,
    type RoomCtx,
    WALL_CLEAR_MM,
    clearBoxes,
    fitIntoRoom,
    placeFirstFree,
    pt,
} from './fixtures-placement.js';

function getRoomBox(r: GridRoom, gridMm: number): Box {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const rc of r.rects) {
        minX = Math.min(minX, rc.x * gridMm);
        maxX = Math.max(maxX, (rc.x + rc.w) * gridMm);
        minY = Math.min(minY, rc.y * gridMm);
        maxY = Math.max(maxY, (rc.y + rc.h) * gridMm);
    }
    return { minX, maxX, minY, maxY };
}

export function generateFloorFixtures(
    level: number,
    rooms: readonly GridRoom[],
    v: PlanInput,
    gridMm: number,
    doorZones: readonly Box[] = [],
): readonly Fixture[] {
    const fixtures: Fixture[] = [];
    const pfx = `fix-${level.toString()}`;
    const push = (f: Fixture | null): void => {
        if (f) fixtures.push(f);
    };

    for (const r of rooms) {
        const b = getRoomBox(r, gridMm);
        const room: RoomCtx = {
            clear: clearBoxes(r, gridMm),
            placed: [],
            keepClear: doorZones,
        };

        if (r.type === 'ldk') {
            for (const f of generateLdkFixtures(pfx, b, v, pt)) {
                push(fitIntoRoom(f, room));
            }
        } else if (r.type === 'bath') {
            push(
                placeFirstFree(
                    { id: `${pfx}-bath-${r.id}`, kind: 'bathtub', rotation: 0 },
                    [{ x: b.minX + 100, y: b.minY + 100 }],
                    room,
                ),
            );
        } else if (r.type === 'wash') {
            push(
                placeFirstFree(
                    {
                        id: `${pfx}-vanity-${r.id}`,
                        kind: 'vanity',
                        rotation: 0,
                    },
                    [{ x: b.minX + 100, y: b.minY + 100 }],
                    room,
                ),
            );
            // Beside the vanity when the room is wide enough, else in the opposite corner.
            if (b.maxX - b.minX >= 1800)
                push(
                    placeFirstFree(
                        {
                            id: `${pfx}-wm-${r.id}`,
                            kind: 'washing_machine',
                            rotation: 0,
                        },
                        [
                            { x: b.minX + 100 + 1100 + 60, y: b.minY + 100 },
                            {
                                x: b.maxX - WALL_CLEAR_MM - 680,
                                y: b.maxY - WALL_CLEAR_MM - 680,
                            },
                        ],
                        room,
                    ),
                );
        } else if (r.type === 'toilet') {
            const midX = (b.minX + b.maxX) / 2;
            push(
                placeFirstFree(
                    {
                        id: `${pfx}-wc-${r.id}`,
                        kind: 'toilet_bowl',
                        rotation: 0,
                    },
                    [{ x: midX - 225, y: b.minY + 150 }],
                    room,
                ),
            );
        } else if (r.type === 'bedroom' && r.key === 'master') {
            push(
                placeFirstFree(
                    {
                        id: `${pfx}-bed-master`,
                        kind: 'bed_double',
                        rotation: 0,
                    },
                    [{ x: b.minX + 150, y: b.minY + 150 }],
                    room,
                ),
            );
        } else if (r.type === 'childRoom') {
            push(
                placeFirstFree(
                    {
                        id: `${pfx}-bed-${r.id}`,
                        kind: 'bed_single',
                        rotation: 0,
                    },
                    [{ x: b.minX + 150, y: b.minY + 150 }],
                    room,
                ),
            );
            // Beside the bed against the far wall, else at the foot of the bed.
            if (b.maxY - b.minY >= 2700)
                push(
                    placeFirstFree(
                        {
                            id: `${pfx}-desk-${r.id}`,
                            kind: 'desk',
                            rotation: 0,
                        },
                        [
                            {
                                x: b.maxX - WALL_CLEAR_MM - 1100,
                                y: b.minY + 150,
                            },
                            { x: b.minX + 150, y: b.minY + 150 + 1950 + 60 },
                        ],
                        room,
                    ),
                );
        }
    }
    return fixtures;
}
