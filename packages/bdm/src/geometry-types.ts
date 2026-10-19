export type Point = {
    readonly x: number;
    readonly y: number;
};

export type Polygon = readonly Point[];

export type BoundingBox = {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly widthMm: number;
    readonly depthMm: number;
};
