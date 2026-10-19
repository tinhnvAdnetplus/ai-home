export type PlannerValueType = 'number' | 'string' | 'boolean' | 'string[]';

export type BindingRegistryEntry = {
    readonly key: string;
    readonly valueType: PlannerValueType;
    readonly description: string;
};

export const SITE_AND_BUILDING_BINDINGS: readonly BindingRegistryEntry[] = [
    {
        key: 'site.hasLand',
        valueType: 'string',
        description: 'Land ownership status',
    },
    {
        key: 'site.landAreaTsubo',
        valueType: 'number',
        description: 'Land area in tsubo',
    },
    {
        key: 'site.landShape',
        valueType: 'string',
        description: 'Shape of the land',
    },
    {
        key: 'site.frontage',
        valueType: 'number',
        description: 'Site road frontage in meters',
    },
    {
        key: 'site.depth',
        valueType: 'number',
        description: 'Site depth in meters',
    },
    {
        key: 'site.roadSide',
        valueType: 'string',
        description: 'Compass direction of front road',
    },
    {
        key: 'site.surroundings',
        valueType: 'string[]',
        description: 'Surrounding environmental factors',
    },
    {
        key: 'family.adults',
        valueType: 'number',
        description: 'Number of adult residents',
    },
    {
        key: 'family.children',
        valueType: 'number',
        description: 'Number of child residents',
    },
    {
        key: 'family.twoGen',
        valueType: 'string',
        description: 'Two-generation living arrangement',
    },
    {
        key: 'family.futureFamily',
        valueType: 'string',
        description: 'Future family changes plan',
    },
    {
        key: 'building.targetArea',
        valueType: 'number',
        description: 'Target total floor area in tsubo',
    },
    {
        key: 'building.floors',
        valueType: 'number',
        description: 'Number of building floors (1 or 2)',
    },
    {
        key: 'building.ldkSize',
        valueType: 'number',
        description: 'Desired LDK size in tatami mats',
    },
    {
        key: 'building.masterSize',
        valueType: 'number',
        description: 'Desired master bedroom size',
    },
    {
        key: 'building.kidsRooms',
        valueType: 'number',
        description: 'Number of children rooms',
    },
    {
        key: 'building.kidsSize',
        valueType: 'number',
        description: 'Size of children rooms in tatami mats',
    },
] as const;
