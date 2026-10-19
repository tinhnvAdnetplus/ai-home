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

