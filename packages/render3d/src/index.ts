export { buildScene } from './build-scene.js';
export { buildFloorFixtures, groupFixturesByRoom } from './fixture-builder.js';
export { resolveFixturePlacement, buildFixtureMesh } from './fixture-dispatch.js';
export { createDollhouseCutawayContext } from './dollhouse-cutaway.js';
export { buildDollhouseFloorWalls } from './dollhouse-wall-builder.js';
export { buildPaleBaseFloor } from './dollhouse-pale-base.js';
export { computeSceneBounds } from './bounds.js';
export {
    createMaterialRegistry,
    DEFAULT_WALL_COLOR,
    DEFAULT_ROOF_COLOR,
    DEFAULT_FLOOR_COLOR,
} from './materials.js';
export {
    createContactShadowContext,
    type ContactShadowContext,
} from './contact-shadow.js';
export {
    toThreeX,
    toThreeY,
    toThreeZ,
    toThreePoint,
    computeSegmentAngle,
    MM_TO_M,
} from './coords.js';
export type {
    MaterialOptions,
    Render3dOptions,
    Point3D,
    SceneBounds,
    BuildSceneResult,
    MaterialRegistry,
} from './types.js';
export {
    planSite,
    spacesThatFit,
    type GroundBox,
    type SitePlan,
} from './site-plan.js';
export {
    planShrubs,
    planTrees,
    houseGround,
    isShrubBlocked,
} from './site-shrubs.js';
export { computeExtents, findEntrancePos } from './site-extents.js';
