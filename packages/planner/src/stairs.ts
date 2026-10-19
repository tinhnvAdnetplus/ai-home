import { type Stair } from '@aihome/bdm';
import { type GridRoom } from './types.js';

export function createStairElement(
    stairRoom: GridRoom,
    level: number,
    gridMm: number,
): Stair | null {
    const rc = stairRoom.rects[0];
    if (!rc) return null;

    const x1 = rc.x * gridMm;
    const y1 = rc.y * gridMm;
    const x2 = (rc.x + rc.w) * gridMm;
    const y2 = (rc.y + rc.h) * gridMm;

    return {
        id: `stair-level-${level.toString()}`,
        polygon: [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 },
        ],
        direction: 'uturn-y1',
        steps: 14,
        upFloor: level + 1,
        downFloor: level,
    };
}
