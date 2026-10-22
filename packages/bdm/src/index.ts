export type { Point, Polygon, BoundingBox } from './geometry-types.js';
export {
    ROOM_TYPES,
    WALL_KINDS,
    OPENING_KINDS,
    ROOF_KINDS,
    PARKING_KINDS,
    ROAD_SIDES,
    EXTERIOR_WALL_COLORS,
    EXTERIOR_ROOF_COLORS,
    EXTERIOR_ACCENT_COLORS,
} from './element-types.js';
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
} from './element-types.js';
export type {
    Room,
    Wall,
    Opening,
    Fixture,
    Stair,
    Floor,
    SiteRoad,
    SiteSetbacks,
    Site,
    Roof,
    Parking,
    SiteTree,
    Exterior,
    ModelMeta,
    BdmIssue,
    BuildingModel,
    ParseBuildingModelResult,
} from './types.js';
export {
    pointSchema,
    polygonSchema,
    roomSchema,
    wallSchema,
    openingSchema,
    fixtureSchema,
    stairSchema,
    floorSchema,
    siteRoadSchema,
    siteSetbacksSchema,
    siteSchema,
    roofSchema,
    parkingSchema,
    siteTreeSchema,
    exteriorSchema,
    modelMetaSchema,
    bdmIssueSchema,
    buildingModelSchema,
} from './schema.js';
export { parseBuildingModel } from './validate.js';
export { roomsOf, totalFloorAreaM2, boundingBox } from './helpers.js';
export {
    roadCompass,
    compassToFace,
    faceToCompass,
    sunFace,
    northArrowAngleDeg,
} from './orientation.js';
export type { Compass, ModelFace } from './orientation.js';
export { migrateBuildingModel } from './migrate.js';
export {
    GEOMETRY_TOLERANCE_MM,
    DEFAULT_GRID_MM,
    EXTERIOR_WALL_THICKNESS_MM,
    INTERIOR_WALL_THICKNESS_MM,
    GROUND_STOREY_HEIGHT_MM,
    UPPER_STOREY_HEIGHT_MM,
    gridToCanonical,
    stackStoreyElevations,
    storeyHeightForLevel,
    storeyZRange,
    liftToFloor,
    faceOutwardNormal,
} from './coordinates.js';
export type { CanonicalPoint3 } from './coordinates.js';
export { resolveWallSpans } from './wall-joints.js';
export {
    wallSolidRect,
    wallLengthMm,
    wallThicknessMm,
    isAxisAlignedWall,
} from './wall-geometry.js';
export type { WallSpan } from './wall-joints.js';
export {
    classifyRects,
    classifyBoxes,
    rectOverlapDepth,
    rectOverlapArea,
} from './solids.js';
export {
    rectOfPolygon,
    isPointInPolygon,
    isRectilinear,
    rectAreaOutsidePolygon,
    polygonOverlapArea,
} from './polygon-ops.js';
export type { Rect2, Box3, SolidRelation, RelationResult } from './solids.js';

