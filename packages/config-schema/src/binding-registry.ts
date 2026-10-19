import {
    SITE_AND_BUILDING_BINDINGS,
    type BindingRegistryEntry,
    type PlannerValueType,
} from './binding-registry-data.js';

export type { BindingRegistryEntry, PlannerValueType };

const OTHER_BINDINGS: readonly BindingRegistryEntry[] = [
    {
        key: 'rooms.roomTypes',
        valueType: 'string[]',
        description: 'Selected room types to include',
    },
    {
        key: 'rooms.toilets',
        valueType: 'number',
        description: 'Number of toilet rooms',
    },
    {
        key: 'rooms.bathSize',
        valueType: 'string',
        description: 'Bathroom size specification',
    },
    {
        key: 'rooms.bathFloor',
        valueType: 'string',
        description: 'Floor placement for bathroom',
    },
    {
        key: 'rooms.washCount',
        valueType: 'number',
        description: 'Number of washbasins',
    },
    {
        key: 'rooms.waterOpts',
        valueType: 'string[]',
        description: 'Additional water amenities',
    },
    {
        key: 'rooms.tatamiRoom',
        valueType: 'string',
        description: 'Japanese tatami room preference',
    },
    {
        key: 'rooms.storageLevel',
        valueType: 'string',
        description: 'Storage volume preference',
    },
    {
        key: 'rooms.wfh',
        valueType: 'string',
        description: 'Work from home space preference',
    },
    {
        key: 'design.exteriorStyle',
        valueType: 'string',
        description: 'Exterior design preference',
    },
    {
        key: 'design.roofType',
        valueType: 'string',
        description: 'Roof shape type',
    },
    {
        key: 'design.interiorStyle',
        valueType: 'string',
        description: 'Interior design tone',
    },
    {
        key: 'priorities.priorities',
        valueType: 'string[]',
        description: 'Key lifestyle priorities',
    },
    {
        key: 'priorities.mustHave',
        valueType: 'string[]',
        description: 'Features that must be preserved',
    },
    {
        key: 'priorities.notNeeded',
        valueType: 'string[]',
        description: 'Features that can be removed',
    },
    {
        key: 'budget.total',
        valueType: 'number',
        description: 'Total construction budget',
    },
    {
        key: 'budget.scope',
        valueType: 'string',
        description: 'Budget scope (建物のみ, 土地込み)',
    },
    {
        key: 'parking.cars',
        valueType: 'number',
        description: 'Number of parking spaces needed',
    },
    {
        key: 'parking.evCharger',
        valueType: 'string',
        description: 'EV charger preference',
    },
    {
        key: 'performance.insulation',
        valueType: 'string',
        description: 'Insulation performance grade',
    },
    {
        key: 'performance.seismic',
        valueType: 'string',
        description: 'Seismic resistance grade',
    },
    {
        key: 'performance.solar',
        valueType: 'string',
        description: 'Solar power system preference',
    },
] as const;

export const BINDING_REGISTRY: readonly BindingRegistryEntry[] = [
    ...SITE_AND_BUILDING_BINDINGS,
    ...OTHER_BINDINGS,
];

export function findBindingEntry(
    key: string,
): BindingRegistryEntry | undefined {
    return BINDING_REGISTRY.find((entry) => entry.key === key);
}
