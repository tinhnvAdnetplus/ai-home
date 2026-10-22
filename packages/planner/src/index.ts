export type {
    PlanInput,
    PlanScore,
    PlanSummary,
    Plan,
    PlanResult,
    SafePlanResult,
    GridRect,
    GridRoom,
} from './types.js';

export { planInputSchema } from './input-schema.js';
export { normalizePlanInput } from './input-normalize.js';
export { type PlannerConfig, defaultPlannerConfig } from './config.js';
export { generatePlans, generatePlansSafe } from './generate.js';
export { createPrng, type Prng } from './prng.js';
export { VARIANTS, type VariantDefinition } from './variants.js';

export { mapAnswersToPlanInput } from './answers-mapping.js';
export type {
    Issue,
    MappingIssue,
    AnswersMappingResult,
    CoverageReport,
    UnconsumedFieldNote,
    UnmappedPlanInputField,
    UnconsumedFieldCategory,
} from './answers-types.js';
export {
    CONSUMED_WIZARD_FIELDS,
    UNCONSUMED_WIZARD_FIELDS,
    UNMAPPED_PLAN_INPUT_FIELDS,
    getCoverageReport,
} from './answers-coverage.js';
export {
    TSUBO_IN_M2,
    m2ToTsubo,
    tsuboToM2,
    parseNumericUnit,
    type ParsedNumericUnit,
} from './answers-units.js';
export {
    FLOORS_TABLE,
    BUDGET_RANGE_TABLE,
    TARGET_AREA_RANGE_TABLE,
    LDK_SIZE_TABLE,
    MASTER_SIZE_TABLE,
    KIDS_ROOM_COUNT_TABLE,
    KIDS_ROOM_SIZE_TABLE,
    TATAMI_COUNT_TABLE,
    TATAMI_SIZE_TABLE,
    PARKING_COUNT_TABLE,
    ROAD_SIDE_TABLE,
    LAND_SHAPE_TABLE,
    BATH_SIZE_TABLE,
    TOILETS_COUNT_TABLE,
    KITCHEN_TYPE_TABLE,
    FAMILY_ADULTS_TABLE,
    FAMILY_CHILDREN_TABLE,
} from './answers-tables.js';

export {
    DesignConstraintsSchema,
    PrioritiesSchema,
    RoomHintSchema,
    AdjacencySchema,
    OrientationSchema,
    AccessibilitySchema,
    type DesignConstraints,
    type Priorities,
    type RoomHint,
    type Adjacency,
    type Orientation,
    type Accessibility,
} from './constraints.js';
export { applyDesignConstraints } from './constraints-apply.js';

export { checkPlanConformance } from './conformance.js';
export type {
    ConformanceCheck,
    ConformanceReport,
    ConformanceStatus,
} from './conformance-helpers.js';

export {
    aiLayoutSchema,
    parseAiLayout,
    type AiLayout,
    type AiLayoutDoor,
    type AiLayoutFixture,
    type AiLayoutWindow,
    type AiLayoutExterior,
} from './ai-layout-schema.js';

export { checkAiLayout, layoutLimits } from './ai-layout-check.js';
export { buildAiLayoutContext, pickLayoutFocus } from './ai-layout-context.js';
export { planFromAiLayout } from './ai-layout-plan.js';
export {
    FIXTURE_KINDS,
    FIXTURE_CATALOG,
    fixtureFootprintMm,
    fixtureFootprintCells,
    isFixtureKind,
    type FixtureKind,
    type FixtureRotation,
} from './fixture-catalog.js';
export { validateLayout } from './plan-validator.js';
export {
    validateSolids,
    SLIDING_DOOR_CLEAR_DEPTH_MM,
    MAX_SWING_DEPTH_MM,
    type SolidFinding,
    type SolidValidationReport,
} from './solid-validator.js';
export {
    convertAiFixtures,
    FIXTURE_WALL_GAP_MM,
    type AiFixtureWallContext,
} from './ai-layout-fixtures-convert.js';
export {
    keepTreeOffBuilding,
    TREE_WALL_CLEARANCE_MM,
} from './site-clearance.js';
export { lotOverflow, type LotOverflow } from './lot-fit.js';
export {
    assessFeasibility,
    effectiveProgram,
    type FeasibilityIssue,
    type FeasibilityReport,
} from './feasibility.js';
export {
    applyAdjustments,
    describeKnobs,
    type AppliedAdjustment,
    type BriefAdjustment,
} from './brief.js';
export {
    inputCorrections,
    ruleAdjust,
    measureWhatIfs,
    localReview,
    type WhatIf,
    type LocalReview,
} from './review.js';
export { generateReviewedPlans } from './generate-reviewed.js';
export {
    detectAnswerConflicts,
    isFloorsFlexible,
    type AnswerConflict,
} from './answers-conflicts.js';
export { type ReviewOptions } from './review-steps.js';
export { NUMERIC_KNOBS, ENUM_KNOBS, LIST_KNOBS } from './brief-knobs.js';
export { buildBriefContext } from './brief-context.js';
