import { type PlanInput } from '@aihome/planner';

export type PresetKey = 'preset-1' | 'preset-2' | 'preset-3';

export type PlanPreset = {
    readonly id: PresetKey;
    readonly titleKey: 'preset1Name' | 'preset2Name' | 'preset3Name';
    readonly input: PlanInput;
};

export const ONE_STOREY_NARROW_INPUT: PlanInput = {
    frontage: 7.0,
    landDepth: 16.0,
    landAreaTsubo: 33.9,
    roadSide: '南',
    floors: 1,
    targetArea: 20.0,
    ldkSize: 16.0,
    masterSize: 6.0,
    kidsRooms: 1,
    kidsSize: 4.5,
    toilets: 1,
    bathSize: '1坪',
    bathFloor: '1階',
    washCount: 1,
    tatamiRoom: 'なし',
    cars: 1,
    parkingType: 'surface',
    roofType: '切妻',
};

export const TWO_STOREY_STANDARD_INPUT: PlanInput = {
    frontage: 9.0,
    landDepth: 14.0,
    landAreaTsubo: 38.0,
    roadSide: '南',
    floors: 2,
    targetArea: 30.0,
    ldkSize: 18.0,
    masterSize: 8.0,
    kidsRooms: 2,
    kidsSize: 5.0,
    toilets: 2,
    bathSize: '1坪',
    bathFloor: '1階',
    washCount: 1,
    tatamiRoom: 'なし',
    cars: 2,
    parkingType: 'surface',
    roofType: '切妻',
};

export const TWO_STOREY_LARGE_TATAMI_INPUT: PlanInput = {
    frontage: 11.0,
    landDepth: 15.0,
    landAreaTsubo: 50.0,
    roadSide: '南',
    floors: 2,
    targetArea: 36.0,
    ldkSize: 20.0,
    masterSize: 8.0,
    kidsRooms: 2,
    kidsSize: 6.0,
    toilets: 2,
    bathSize: '1.25坪',
    bathFloor: '1階',
    washCount: 2,
    tatamiRoom: '和室（6帖）',
    cars: 2,
    parkingType: 'carport',
    roofType: '寄棟',
};

export const PLAN_PRESETS: readonly PlanPreset[] = [
    {
        id: 'preset-1',
        titleKey: 'preset1Name',
        input: ONE_STOREY_NARROW_INPUT,
    },
    {
        id: 'preset-2',
        titleKey: 'preset2Name',
        input: TWO_STOREY_STANDARD_INPUT,
    },
    {
        id: 'preset-3',
        titleKey: 'preset3Name',
        input: TWO_STOREY_LARGE_TATAMI_INPUT,
    },
];
