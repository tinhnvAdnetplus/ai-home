import {
    type Point,
    type Polygon,
    type BoundingBox,
} from './geometry-types.js';
import {
    type RoomType,
    type WallKind,
    type OpeningKind,
    type RoofKind,
    type ParkingKind,
    type RoadSide,
    type ExteriorWallColor,
    type ExteriorRoofColor,
    type ExteriorAccentColor,
} from './element-types.js';

export type { Point, Polygon, BoundingBox };
export type {
    RoomType,
    WallKind,
    OpeningKind,
    RoofKind,
    ParkingKind,
    RoadSide,
    ExteriorWallColor,
    ExteriorRoofColor,
    ExteriorAccentColor,
};

export type Room = {
    readonly id: string;
    readonly type: RoomType;
    readonly name: string;
    readonly polygon: Polygon;
    readonly areaM2: number;
};

export type Wall = {
    readonly id: string;
    readonly a: Point;
    readonly b: Point;
    readonly thicknessMm: number;
    readonly kind: WallKind;
};

export type Opening = {
    readonly id: string;
    readonly wallId: string;
    readonly offsetMm: number;
    readonly widthMm: number;
    readonly heightMm: number;
    readonly sillMm: number;
    readonly kind: OpeningKind;
};

export type Fixture = {
    readonly id: string;
    readonly kind: string;
    readonly pos: Point;
    readonly rotation: number;
};

export type Stair = {
    readonly id: string;
    readonly polygon: Polygon;
    readonly direction: string;
    readonly steps: number;
    readonly upFloor: number;
    readonly downFloor: number;
};

export type Floor = {
    readonly level: number;
    readonly elevationMm: number;
    readonly heightMm: number;
    readonly rooms: readonly Room[];
    readonly walls: readonly Wall[];
    readonly openings: readonly Opening[];
    readonly fixtures: readonly Fixture[];
    readonly stairs: readonly Stair[];
};

export type SiteRoad = {
    readonly side: RoadSide;
    readonly widthMm: number;
};

export type SiteSetbacks = {
    readonly frontMm: number;
    readonly rearMm: number;
    readonly leftMm: number;
    readonly rightMm: number;
};

export type Site = {
    readonly boundary: Polygon;
    readonly areaM2: number;
    readonly road: SiteRoad;
    readonly setbacks: SiteSetbacks;
};

export type Roof = {
    readonly kind: RoofKind;
    readonly pitch: number;
    readonly overhangMm: number;
};

export type Parking = {
    readonly spaces: number;
    readonly kind: ParkingKind;
    readonly polygon?: Polygon | undefined;
};

export type SiteTree = {
    readonly pos: Point;
    readonly radiusMm: number;
};

export type Exterior = {
    readonly wallColor?: ExteriorWallColor | undefined;
    readonly roofColor?: ExteriorRoofColor | undefined;
    readonly accentColor?: ExteriorAccentColor | undefined;
    readonly hasEntranceLattice?: boolean | undefined;
    readonly deckPolygon?: Polygon | undefined;
    readonly approachPolygon?: Polygon | undefined;
    readonly trees?: readonly SiteTree[] | undefined;
};

export type ModelMeta = {
    readonly generator: string;
    readonly seed: number;
    readonly inputHash: string;
};

export type BdmIssue = {
    readonly path: readonly (string | number)[];
    readonly code: string;
    readonly message: string;
    readonly level?: 'info' | 'warn' | 'error' | undefined;
};

export type BuildingModel = {
    readonly schemaVersion: number;
    readonly meta: ModelMeta;
    readonly site: Site;
    readonly floors: readonly Floor[];
    readonly roof: Roof;
    readonly parking: Parking;
    readonly exterior?: Exterior | undefined;
    readonly warnings: readonly BdmIssue[];
};

export type ParseBuildingModelResult =
    | { readonly ok: true; readonly data: BuildingModel }
    | { readonly ok: false; readonly issues: readonly BdmIssue[] };

