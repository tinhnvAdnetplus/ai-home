<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Planner capability registry containing the 39 supported planner binding keys.
 *
 * Mirrored from:
 * - packages/config-schema/src/binding-registry-data.ts
 * - packages/config-schema/src/binding-registry.ts
 * - packages/config-schema/src/wizard/binding-validator.ts
 */
final class BindingRegistry
{
    /**
     * The 39 planner inputs.
     *
     * @var list<array{key: string, valueType: 'number'|'string'|'boolean'|'string[]', description: string}>
     */
    public const BINDINGS = [
        // SITE_AND_BUILDING_BINDINGS (17)
        [
            'key' => 'site.hasLand',
            'valueType' => 'string',
            'description' => 'Land ownership status',
        ],
        [
            'key' => 'site.landAreaTsubo',
            'valueType' => 'number',
            'description' => 'Land area in tsubo',
        ],
        [
            'key' => 'site.landShape',
            'valueType' => 'string',
            'description' => 'Shape of the land',
        ],
        [
            'key' => 'site.frontage',
            'valueType' => 'number',
            'description' => 'Site road frontage in meters',
        ],
        [
            'key' => 'site.depth',
            'valueType' => 'number',
            'description' => 'Site depth in meters',
        ],
        [
            'key' => 'site.roadSide',
            'valueType' => 'string',
            'description' => 'Compass direction of front road',
        ],
        [
            'key' => 'site.surroundings',
            'valueType' => 'string[]',
            'description' => 'Surrounding environmental factors',
        ],
        [
            'key' => 'family.adults',
            'valueType' => 'number',
            'description' => 'Number of adult residents',
        ],
        [
            'key' => 'family.children',
            'valueType' => 'number',
            'description' => 'Number of child residents',
        ],
        [
            'key' => 'family.twoGen',
            'valueType' => 'string',
            'description' => 'Two-generation living arrangement',
        ],
        [
            'key' => 'family.futureFamily',
            'valueType' => 'string',
            'description' => 'Future family changes plan',
        ],
        [
            'key' => 'building.targetArea',
            'valueType' => 'number',
            'description' => 'Target total floor area in tsubo',
        ],
        [
            'key' => 'building.floors',
            'valueType' => 'number',
            'description' => 'Number of building floors (1 or 2)',
        ],
        [
            'key' => 'building.ldkSize',
            'valueType' => 'number',
            'description' => 'Desired LDK size in tatami mats',
        ],
        [
            'key' => 'building.masterSize',
            'valueType' => 'number',
            'description' => 'Desired master bedroom size',
        ],
        [
            'key' => 'building.kidsRooms',
            'valueType' => 'number',
            'description' => 'Number of children rooms',
        ],
        [
            'key' => 'building.kidsSize',
            'valueType' => 'number',
            'description' => 'Size of children rooms in tatami mats',
        ],

        // OTHER_BINDINGS (22)
        [
            'key' => 'rooms.roomTypes',
            'valueType' => 'string[]',
            'description' => 'Selected room types to include',
        ],
        [
            'key' => 'rooms.toilets',
            'valueType' => 'number',
            'description' => 'Number of toilet rooms',
        ],
        [
            'key' => 'rooms.bathSize',
            'valueType' => 'string',
            'description' => 'Bathroom size specification',
        ],
        [
            'key' => 'rooms.bathFloor',
            'valueType' => 'string',
            'description' => 'Floor placement for bathroom',
        ],
        [
            'key' => 'rooms.washCount',
            'valueType' => 'number',
            'description' => 'Number of washbasins',
        ],
        [
            'key' => 'rooms.waterOpts',
            'valueType' => 'string[]',
            'description' => 'Additional water amenities',
        ],
        [
            'key' => 'rooms.tatamiRoom',
            'valueType' => 'string',
            'description' => 'Japanese tatami room preference',
        ],
        [
            'key' => 'rooms.storageLevel',
            'valueType' => 'string',
            'description' => 'Storage volume preference',
        ],
        [
            'key' => 'rooms.wfh',
            'valueType' => 'string',
            'description' => 'Work from home space preference',
        ],
        [
            'key' => 'design.exteriorStyle',
            'valueType' => 'string',
            'description' => 'Exterior design preference',
        ],
        [
            'key' => 'design.roofType',
            'valueType' => 'string',
            'description' => 'Roof shape type',
        ],
        [
            'key' => 'design.interiorStyle',
            'valueType' => 'string',
            'description' => 'Interior design tone',
        ],
        [
            'key' => 'priorities.priorities',
            'valueType' => 'string[]',
            'description' => 'Key lifestyle priorities',
        ],
        [
            'key' => 'priorities.mustHave',
            'valueType' => 'string[]',
            'description' => 'Features that must be preserved',
        ],
        [
            'key' => 'priorities.notNeeded',
            'valueType' => 'string[]',
            'description' => 'Features that can be removed',
        ],
        [
            'key' => 'budget.total',
            'valueType' => 'number',
            'description' => 'Total construction budget',
        ],
        [
            'key' => 'budget.scope',
            'valueType' => 'string',
            'description' => 'Budget scope (建物のみ, 土地込み)',
        ],
        [
            'key' => 'parking.cars',
            'valueType' => 'number',
            'description' => 'Number of parking spaces needed',
        ],
        [
            'key' => 'parking.evCharger',
            'valueType' => 'string',
            'description' => 'EV charger preference',
        ],
        [
            'key' => 'performance.insulation',
            'valueType' => 'string',
            'description' => 'Insulation performance grade',
        ],
        [
            'key' => 'performance.seismic',
            'valueType' => 'string',
            'description' => 'Seismic resistance grade',
        ],
        [
            'key' => 'performance.solar',
            'valueType' => 'string',
            'description' => 'Solar power system preference',
        ],
    ];

    /**
     * Find a binding registry entry by key.
     *
     * @return array{key: string, valueType: 'number'|'string'|'boolean'|'string[]', description: string}|null
     */
    public static function find(string $key): ?array
    {
        foreach (self::BINDINGS as $entry) {
            if ($entry['key'] === $key) {
                return $entry;
            }
        }

        return null;
    }

    /**
     * Check if a field type is compatible with a planner binding value type.
     * Mirrors isBindingTypeCompatible in packages/config-schema/src/wizard/binding-validator.ts.
     */
    public static function isCompatible(string $fieldType, bool $isMultiple, string $valueType): bool
    {
        return match ($valueType) {
            'number' => $fieldType === 'number' || $fieldType === 'range',
            'string' => in_array($fieldType, ['text', 'textarea', 'select', 'radio'], true)
                || ($fieldType === 'image_select' && ! $isMultiple),
            'boolean' => $fieldType === 'boolean',
            'string[]' => $fieldType === 'checkbox_group'
                || ($fieldType === 'image_select' && $isMultiple),
            default => false,
        };
    }
}
