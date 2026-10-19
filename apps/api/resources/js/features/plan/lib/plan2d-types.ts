export type Plan2dOptions = {
    readonly isGridVisible: boolean;
    readonly isFixturesVisible: boolean;
    readonly isDimensionsVisible: boolean;
    readonly isColorMode: boolean;
};

export const DEFAULT_PLAN2D_OPTIONS: Plan2dOptions = {
    isGridVisible: true,
    isFixturesVisible: true,
    isDimensionsVisible: true,
    isColorMode: true,
};

export type FloorPlanViewHandle = {
    readonly getSvgElement: () => SVGSVGElement | null;
};

export type FloorFinishKind = 'wood' | 'tatami' | 'tile' | 'doma' | 'none';

export type DimensionTick = {
    readonly pos: number;
    readonly label: string;
};

export type DimensionChain = {
    readonly offset: number;
    readonly start: number;
    readonly end: number;
    readonly totalLabel: string;
    readonly ticks: readonly DimensionTick[];
};

export type RoomBounds = {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly width: number;
    readonly height: number;
};
