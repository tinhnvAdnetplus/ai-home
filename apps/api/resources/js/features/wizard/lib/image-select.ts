export const IMAGE_SELECT_COLUMNS: Readonly<Record<number, string>> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
};

const FIELD_GRID_COLUMNS: Readonly<Record<string, string>> = {
    design_features: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-3',
    design_exterior_wall_color: 'grid-cols-5 sm:grid-cols-6',
    design_roof_color: 'grid-cols-5 sm:grid-cols-6',
    design_flooring_material: 'grid-cols-2 sm:grid-cols-4',
    design_wall_color: 'grid-cols-2 sm:grid-cols-4',
    life_pets: 'grid-cols-2 sm:grid-cols-4',
    life_parking: 'grid-cols-2 sm:grid-cols-4',
    life_flow: 'grid-cols-2 sm:grid-cols-4',
    life_spaces: 'grid-cols-2 sm:grid-cols-4',
    life_priorities: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
    design_exterior_style: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
    design_interior_style: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
    design_favorite_photos: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
};

export function getFieldGridColumns(
    fieldKey: string,
    optionCount: number,
): string {
    return (
        FIELD_GRID_COLUMNS[fieldKey] ??
        IMAGE_SELECT_COLUMNS[optionCount] ??
        'sm:grid-cols-4'
    );
}

export function toSelectedValues(
    isMultiple: boolean,
    value: string | readonly string[] | undefined,
): readonly string[] {
    if (isMultiple) {
        return Array.isArray(value)
            ? value.filter((v): v is string => typeof v === 'string')
            : [];
    }
    return typeof value === 'string' ? [value] : [];
}
