export type PanZoomState = {
    readonly zoom: number;
    readonly panX: number;
    readonly panY: number;
};

export type ViewportBounds = {
    readonly minX: number;
    readonly minY: number;
    readonly width: number;
    readonly height: number;
};

export type RoomStyle = {
    readonly fill: string;
    readonly stroke: string;
    readonly textColor: string;
};
