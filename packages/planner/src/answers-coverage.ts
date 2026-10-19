import { type CoverageReport } from './answers-types.js';
import { UNCONSUMED_WIZARD_FIELDS } from './answers-unconsumed.js';
import { UNMAPPED_PLAN_INPUT_FIELDS } from './answers-unmapped.js';

export { UNCONSUMED_WIZARD_FIELDS } from './answers-unconsumed.js';
export { UNMAPPED_PLAN_INPUT_FIELDS } from './answers-unmapped.js';

export const CONSUMED_WIZARD_FIELDS = [
    'floors',
    'family_adults',
    'family_children',
    'budget_range',
    'target_area_range',
    'house_style',
    'land_area',
    'land_shape',
    'frontage',
    'depth',
    'road_side',
    'surroundings',
    'plan_type',
    'plan_target_area',
    'plan_ldk_size',
    'plan_master_bedroom_size',
    'plan_kids_room_count',
    'plan_kids_room_size',
    'plan_tatami_count',
    'plan_tatami_size',
    'plan_study_count',
    'plan_study_size',
    'plan_kitchen',
    'plan_bath',
    'plan_washroom',
    'plan_toilet',
    'plan_storage',
    'plan_parking_count',
    'plan_parking_options',
    'life_priorities',
    'life_flow',
    'life_spaces',
    'life_parking',
    'life_work',
    'design_exterior_style',
    'design_interior_style',
    'design_features',
] as const;

export function getCoverageReport(): CoverageReport {
    return {
        totalWizardFields:
            CONSUMED_WIZARD_FIELDS.length + UNCONSUMED_WIZARD_FIELDS.length,
        consumedWizardFields: CONSUMED_WIZARD_FIELDS,
        unconsumedWizardFields: UNCONSUMED_WIZARD_FIELDS,
        unmappedPlanInputFields: UNMAPPED_PLAN_INPUT_FIELDS,
    };
}
