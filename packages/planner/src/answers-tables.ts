/** Option lookup tables and midpoint conversions for wizard answers mapping. */
export const FLOORS_TABLE: Readonly<Record<string, 1 | 2>> = {
    one_story: 1,
    two_story: 2,
    three_story: 2, // 3-story mapped to 2 with issue notification
    consult: 2,
    other: 2,
};

/** Budget bands in 万円: representative midpoints */
export const BUDGET_RANGE_TABLE: Readonly<Record<string, number>> = {
    budget_under_1500: 1200, // 900-1500万円 compact home midpoint
    budget_1500_2500: 2000, // 1500-2500万円 standard builder midpoint
    budget_2500_3500: 3000, // 2500-3500万円 family home midpoint
    budget_3500_5000: 4250, // 3500-5000万円 premium home midpoint
    budget_over_5000: 6000, // >= 5000万円 custom luxury entry
    budget_undecided: 3500, // National standard detached home budget
};

/** Total floor area bands in 坪: representative midpoints */
export const TARGET_AREA_RANGE_TABLE: Readonly<Record<string, number>> = {
    area_under_25: 22.5, // Midpoint of 20-25坪 compact floorplan
    area_25_30: 27.5, // Midpoint of 25-30坪 3LDK plan
    area_30_35: 32.5, // Midpoint of 30-35坪 standard 4LDK plan
    area_35_40: 37.5, // Midpoint of 35-40坪 spacious family plan
    area_over_40: 45.0, // Representative value for >= 40坪 large estate
    area_unknown: 32.0, // National median floor area for detached houses
};

export const LDK_SIZE_TABLE: Readonly<Record<string, number>> = {
    size_14: 14,
    size_16: 16,
    size_18: 18,
    size_20: 20,
    size_22: 22,
    size_24_plus: 24,
    consult: 18,
};

export const MASTER_SIZE_TABLE: Readonly<Record<string, number>> = {
    size_6: 6,
    size_7: 7,
    size_8: 8,
    size_10: 10,
    size_12_plus: 12,
    consult: 8,
};

export const KIDS_ROOM_COUNT_TABLE: Readonly<Record<string, number>> = {
    count_0: 0,
    count_1: 1,
    count_2: 2,
    count_3: 3,
    count_4_plus: 4,
};

export const KIDS_ROOM_SIZE_TABLE: Readonly<Record<string, number>> = {
    size_4_5: 4.5,
    size_5: 5,
    size_6: 6,
    size_8: 8,
    consult: 6,
};

export const TATAMI_COUNT_TABLE: Readonly<Record<string, number>> = {
    count_0: 0,
    count_1: 1,
    count_2: 2,
};

export const TATAMI_SIZE_TABLE: Readonly<Record<string, string>> = {
    size_3_4_5: 'リビング続き4.5帖',
    size_6: 'リビング続き6帖',
    size_8_plus: '和室8帖',
    consult: 'リビング続き4.5帖',
};

export const PARKING_COUNT_TABLE: Readonly<Record<string, number>> = {
    none: 0,
    cars_1: 1,
    cars_2: 2,
    cars_3: 3,
    cars_4_plus: 4,
};

export const ROAD_SIDE_TABLE: Readonly<
    Record<string, '北' | '東' | '南' | '西'>
> = {
    north: '北',
    south: '南',
    east: '東',
    west: '西',
    北: '北',
    東: '東',
    南: '南',
    西: '西',
};

export const LAND_SHAPE_TABLE: Readonly<
    Record<string, '正方形' | '長方形' | '変形'>
> = {
    rectangle: '長方形',
    square: '正方形',
    irregular: '変形',
    unknown: '長方形',
    長方形: '長方形',
    正方形: '正方形',
    変形: '変形',
};

export const BATH_SIZE_TABLE: Readonly<
    Record<string, '1坪' | '1.25坪' | '1.5坪'>
> = {
    size_1_0: '1坪',
    size_1_25: '1.25坪',
    size_1_5: '1.5坪',
    '1坪': '1坪',
    '1.25坪': '1.25坪',
    '1.5坪': '1.5坪',
};

export const TOILETS_COUNT_TABLE: Readonly<Record<string, number>> = {
    one_floor: 1,
    two_floors: 2,
    three_or_more: 3,
};

export const KITCHEN_TYPE_TABLE: Readonly<Record<string, string>> = {
    counter: '対面',
    separated: '独立',
    island: 'アイランド',
    対面: '対面',
    独立: '独立',
    アイランド: 'アイランド',
};

export const FAMILY_ADULTS_TABLE: Readonly<Record<string, number>> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five_plus: 5,
};

export const FAMILY_CHILDREN_TABLE: Readonly<Record<string, number>> = {
    none: 0,
    one: 1,
    two: 2,
    three_plus: 3,
};
