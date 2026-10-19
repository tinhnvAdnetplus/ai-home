import { type UnmappedPlanInputField } from './answers-types.js';

export const UNMAPPED_PLAN_INPUT_FIELDS: readonly UnmappedPlanInputField[] = [
    {
        key: 'roofType',
        defaultValue: '切妻',
        rationale: 'Gabled roof is the standard residential archetype in Japan',
    },
    {
        key: 'budgetScope',
        defaultValue: '建物のみ',
        rationale: 'Default to building-only construction scope',
    },
    {
        key: 'insulation',
        defaultValue: '等級6',
        rationale: 'HEAT20 G2 high-efficiency insulation standard',
    },
    {
        key: 'seismic',
        defaultValue: '等級3',
        rationale:
            'Highest earthquake resistance rating in Japanese building code',
    },
    {
        key: 'solar',
        defaultValue: '希望',
        rationale:
            'Standard baseline for ZEH (Net-Zero Energy House) compliance',
    },
    {
        key: 'coverageLimit',
        defaultValue: 60,
        rationale: 'Standard municipal building coverage ratio (建ぺい率)',
    },
    {
        key: 'floorRatioLimit',
        defaultValue: 200,
        rationale: 'Standard municipal floor area ratio (容積率)',
    },
    {
        key: 'evCharger',
        defaultValue: 'なし',
        rationale: 'EV charging outlet defaulted to off unless requested',
    },
    {
        key: 'kidsCloset',
        defaultValue: 'クローゼット',
        rationale: 'Derived from storageLevel preset',
    },
    {
        key: 'bathFloor',
        defaultValue: '1階',
        rationale: 'Ground floor wet zone standard placement',
    },
];
