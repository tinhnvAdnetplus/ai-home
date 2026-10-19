import { type Polygon, type Room } from '@aihome/bdm';

export type Box2D = {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
};

export type DoorObstacle = {
    readonly x: number;
    readonly y: number;
    readonly radiusMm: number;
};

export type PlacedItem = {
    readonly name: string;
    readonly box: Box2D;
};

export type PlacementStats = {
    placedCount: number;
    skippedCount: number;
};

export type PlacementContext = {
    readonly room: Room;
    readonly polygon: Polygon;
    readonly bounds: Box2D;
    readonly elevM: number;
    readonly obstacles: readonly DoorObstacle[];
    readonly placed: PlacedItem[];
    stats: PlacementStats;
};
