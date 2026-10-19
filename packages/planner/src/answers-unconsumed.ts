import { type UnconsumedFieldNote } from './answers-types.js';

export const UNCONSUMED_WIZARD_FIELDS: readonly UnconsumedFieldNote[] = [
    {
        key: 'construction_purpose',
        category: 'crm_notes',
        reason: 'Project workflow type (new build vs remodel); planner models new build',
    },
    {
        key: 'house_type',
        category: 'future_expansion',
        reason: 'Project typology; planner currently synthesizes single-family residences',
    },
    {
        key: 'notes_step1',
        category: 'crm_notes',
        reason: 'Customer free-form briefing text stored for sales consultation',
    },
    {
        key: 'land_location',
        category: 'civil_structural',
        reason: 'Municipal address used for regional pricing / GIS zoning lookups',
    },
    {
        key: 'road_width',
        category: 'civil_structural',
        reason: 'Road width diagonal setback check, handled in 3D envelope analysis',
    },
    {
        key: 'land_elevation',
        category: 'civil_structural',
        reason: 'Site slope and grading, used for foundation / civil engineering',
    },
    {
        key: 'land_surroundings_other',
        category: 'crm_notes',
        reason: 'Free-form text for atypical adjacent property conditions',
    },
    {
        key: 'land_survey_file',
        category: 'civil_structural',
        reason: 'Uploaded CAD/PDF plot surveys for human architect verification',
    },
    {
        key: 'plan_ldk_count',
        category: 'future_expansion',
        reason: 'Multi-LDK separation for two-generation duplexes; single-family defaults to 1',
    },
    {
        key: 'plan_master_bedroom_count',
        category: 'future_expansion',
        reason: 'Multiple master suites; standard single-family defaults to 1',
    },
    {
        key: 'plan_other_room_count',
        category: 'future_expansion',
        reason: 'Extra unspecified bonus rooms beyond study and tatami',
    },
    {
        key: 'plan_other_room_size',
        category: 'future_expansion',
        reason: 'Bonus room size preference',
    },
    {
        key: 'life_pets',
        category: 'styling_materials',
        reason: 'Pet doors and scratch-resistant materials, applied in spec phase',
    },
    {
        key: 'life_future',
        category: 'future_expansion',
        reason: 'Long-term lifecycle projection (future rental, aging-in-place)',
    },
    {
        key: 'life_notes',
        category: 'crm_notes',
        reason: 'Free-form lifestyle notes stored for architectural review',
    },
    {
        key: 'design_exterior_wall_color',
        category: 'styling_materials',
        reason: 'Exterior wall color applied to 3D WebGL renderer',
    },
    {
        key: 'design_roof_color',
        category: 'styling_materials',
        reason: 'Roof material color applied to 3D WebGL renderer',
    },
    {
        key: 'design_flooring_material',
        category: 'styling_materials',
        reason: 'Interior flooring texture applied to 3D WebGL renderer',
    },
    {
        key: 'design_wall_color',
        category: 'styling_materials',
        reason: 'Interior wall paint / wallpaper tone applied to 3D WebGL renderer',
    },
    {
        key: 'design_favorite_photos',
        category: 'styling_materials',
        reason: 'Inspiration moodboard photos stored for design presentation',
    },
    {
        key: 'design_notes',
        category: 'crm_notes',
        reason: 'Free-form interior design requests stored for styling pass',
    },
];
