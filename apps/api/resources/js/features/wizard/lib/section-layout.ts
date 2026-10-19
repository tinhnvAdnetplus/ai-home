import { type Field } from '@aihome/config-schema';

/**
 * Section layout mapping: section key -> Tailwind grid column span on wide screens (12-column grid).
 * Matches the design mockups pixel-for-pixel (docs/design/01..05).
 */
const SECTION_SPANS: Readonly<Record<string, string>> = {
    // Step 1: 基本情報 (01-step1-basic-info.jpg)
    // Heights at 1536x1024: row1 178px (y172-350), row2 140px (y365-505), row3 290px (y520-810), row4 95px (y830-925)
    purpose: 'xl:col-span-6 xl:h-[178px]',
    house_type_section: 'xl:col-span-6 xl:h-[178px]',
    floors_section: 'xl:col-span-6 xl:h-[140px] xl:mt-[5px]',
    family_section: 'xl:col-span-6 xl:h-[140px] xl:mt-[5px]',
    budget_section: 'xl:col-span-4 xl:h-[290px] xl:mt-[5px]',
    area_section: 'xl:col-span-4 xl:h-[290px] xl:mt-[5px]',
    style_section: 'xl:col-span-4 xl:h-[290px] xl:mt-[5px]',
    notes_section: 'xl:col-span-12 xl:h-[95px] xl:mt-[10px]',

    // Step 2: 土地情報 (02-step2-land.jpg)
    land_location_section: 'xl:col-span-6',
    land_area_section: 'xl:col-span-6',
    land_shape_section: 'xl:col-span-6',
    frontage_depth_section: 'xl:col-span-6',
    road_side_section: 'xl:col-span-6',
    road_width_section: 'xl:col-span-3',
    elevation_section: 'xl:col-span-3',
    surroundings_section: 'xl:col-span-6',
    drawings_photos_section: 'xl:col-span-6',

    // Step 3: 間取りの希望 (03-step3-floorplan.jpg)
    plan_type_section: 'xl:col-span-7',
    plan_area_section: 'xl:col-span-5',
    plan_rooms_section: 'xl:col-span-12',
    plan_water_section: 'xl:col-span-12',
    plan_storage_section: 'xl:col-span-7',
    plan_parking_section: 'xl:col-span-5',

    // Step 4: 暮らし方の希望 (04-step4-lifestyle.jpg)
    life_priorities_section: 'xl:col-span-12',
    life_flow_section: 'xl:col-span-6',
    life_spaces_section: 'xl:col-span-6',
    life_pets_section: 'xl:col-span-4',
    life_parking_section: 'xl:col-span-4',
    life_work_section: 'xl:col-span-4',
    life_future_section: 'xl:col-span-4',
    life_notes_section: 'xl:col-span-4',

    // Step 5: デザインの希望 (05-step5-design.jpg)
    design_exterior_style_section: 'w-full',
    design_interior_style_section: 'w-full',
    design_exterior_colors_section: 'xl:col-span-4',
    design_interior_materials_section: 'xl:col-span-4',
    design_features_section: 'xl:col-span-4',
    design_photos_section: 'xl:col-span-8',
    design_notes_section: 'xl:col-span-4',
};

export const HIDE_OPTIONAL_BADGE_SECTIONS = new Set([
    'area_section',
    'style_section',
    'notes_section',
]);

export function optionCount(field: Field): number {
    return 'options' in field ? field.options.length : 0;
}

export function spanClass(fields: readonly Field[]): string {
    if (fields.some((f) => f.type === 'textarea' || f.type === 'upload')) {
        return 'xl:col-span-12';
    }
    const isPhotoStyle = fields.some(
        (f) =>
            f.type === 'image_select' &&
            f.options.every((o) => o.image.mediaId.startsWith('style-')),
    );
    if (
        isPhotoStyle ||
        fields.some((f) => f.type === 'radio' && optionCount(f) >= 5)
    ) {
        return 'xl:col-span-4';
    }
    if (
        fields.some(
            (f) =>
                (f.type === 'image_select' || f.type === 'checkbox_group') &&
                optionCount(f) >= 5,
        )
    ) {
        return 'xl:col-span-12';
    }
    return 'xl:col-span-6';
}

export function getSectionColSpan(sectionKey: string): string | undefined {
    return SECTION_SPANS[sectionKey];
}
