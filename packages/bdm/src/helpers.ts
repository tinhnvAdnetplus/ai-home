import {
    type BuildingModel,
    type Room,
    type RoomType,
    type BoundingBox,
} from './types.js';

export function roomsOf(
    model: BuildingModel,
    filter?: {
        readonly level?: number | undefined;
        readonly type?: RoomType | undefined;
    },
): readonly Room[] {
    const result: Room[] = [];
    for (const floor of model.floors) {
        if (filter?.level !== undefined && floor.level !== filter.level) {
            continue;
        }
        for (const room of floor.rooms) {
            if (filter?.type !== undefined && room.type !== filter.type) {
                continue;
            }
            result.push(room);
        }
    }
    return result;
}

export function totalFloorAreaM2(model: BuildingModel): number {
    let total = 0;
    for (const floor of model.floors) {
        for (const room of floor.rooms) {
            if (
                room.type === 'void' ||
                room.type === 'porch' ||
                room.type === 'deck' ||
                room.type === 'balcony'
            ) {
                continue;
            }
            total += room.areaM2;
        }
    }
    return Math.round(total * 100) / 100;
}

export function boundingBox(model: BuildingModel): BoundingBox {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const floor of model.floors) {
        for (const room of floor.rooms) {
            for (const pt of room.polygon) {
                if (pt.x < minX) minX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y > maxY) maxY = pt.y;
            }
        }
    }

    if (minX === Infinity) {
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            widthMm: 0,
            depthMm: 0,
        };
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        widthMm: maxX - minX,
        depthMm: maxY - minY,
    };
}
