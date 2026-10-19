export type ElevationSide = "south" | "north" | "east" | "west";

export type Point2D = {
  readonly x: number;
  readonly y: number;
};

export type RenderElevationOptions = {
  readonly wallColor?: string | undefined;
  readonly roofColor?: string | undefined;
  readonly frameColor?: string | undefined;
  readonly glassColor?: string | undefined;
  readonly lineColor?: string | undefined;
  readonly groundColor?: string | undefined;
  readonly foundationColor?: string | undefined;
  readonly scale?: number | undefined;
  readonly hasDimensions?: boolean | undefined;
  readonly hasLevels?: boolean | undefined;
  readonly hasChimney?: boolean | undefined;
};

export type ProjectedWall = {
  readonly floorLevel: number;
  readonly uMin: number;
  readonly uMax: number;
  readonly botElev: number;
  readonly topElev: number;
  readonly depth: number;
  readonly wallId: string;
};

export type ProjectedOpening = {
  readonly id: string;
  readonly wallId: string;
  readonly kind: string;
  readonly uMin: number;
  readonly uMax: number;
  readonly sillElev: number;
  readonly topElev: number;
  readonly depth: number;
};

export type ProjectedRoof = {
  readonly kind: string;
  readonly uMin: number;
  readonly uMax: number;
  readonly eaveElev: number;
  readonly ridgeElev: number;
  readonly ridgeU: number;
  readonly points: readonly Point2D[];
  readonly gablePoints?: readonly Point2D[] | undefined;
  readonly lowerRoofs?: readonly (readonly Point2D[])[] | undefined;
};

export type ElevationLevelLine = {
  readonly label: string;
  readonly elevationMm: number;
};

export type ElevationProjection = {
  readonly side: ElevationSide;
  readonly walls: readonly ProjectedWall[];
  readonly openings: readonly ProjectedOpening[];
  readonly roof: ProjectedRoof;
  readonly levels: readonly ElevationLevelLine[];
  readonly uMin: number;
  readonly uMax: number;
  readonly groundElev: number;
  readonly eavesElev: number;
  readonly ridgeElev: number;
};
