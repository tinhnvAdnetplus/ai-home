/**
 * The closed vocabulary of furniture/fixture kinds the AI (or the rule-based generator) can
 * place, with each kind's real physical footprint in mm (axis-aligned, at rotation 0). These are
 * facts about the objects themselves (a toilet bowl is ~450x700mm no matter who designs the
 * room), not a design rule — so they live in code, while the AI only ever picks kind + position
 * + rotation.
 */
export const FIXTURE_KINDS = [
    'kitchen_counter',
    'kitchen_island',
    'kitchen_l',
    'fridge',
    'dining_table_4',
    'dining_table_6',
    'sofa',
    'sofa_l',
    'low_table',
    'tv_board',
    'bathtub',
    'vanity',
    'washing_machine',
    'toilet_bowl',
    'bed_double',
    'bed_single',
    'nightstand',
    'desk',
    'wardrobe',
    'shoe_box',
] as const;

export type FixtureKind = (typeof FIXTURE_KINDS)[number];

/** Narrows a raw BDM `Fixture.kind` (a plain `string`) down to a known catalog kind, so callers
 * can safely skip/ignore anything unrecognized instead of crashing on it. */
export function isFixtureKind(kind: string): kind is FixtureKind {
    return FIXTURE_KINDS.some((k) => k === kind);
}

export const FIXTURE_CATALOG: Record<
    FixtureKind,
    { readonly widthMm: number; readonly heightMm: number }
> = {
    kitchen_counter: { widthMm: 2550, heightMm: 650 },
    kitchen_island: { widthMm: 2400, heightMm: 900 },
    kitchen_l: { widthMm: 2550, heightMm: 1800 },
    fridge: { widthMm: 700, heightMm: 700 },
    dining_table_4: { widthMm: 1100, heightMm: 1100 },
    dining_table_6: { widthMm: 1500, heightMm: 1500 },
    sofa: { widthMm: 1800, heightMm: 850 },
    sofa_l: { widthMm: 2400, heightMm: 1600 },
    low_table: { widthMm: 900, heightMm: 500 },
    tv_board: { widthMm: 1600, heightMm: 400 },
    bathtub: { widthMm: 1600, heightMm: 800 },
    vanity: { widthMm: 1100, heightMm: 550 },
    washing_machine: { widthMm: 680, heightMm: 680 },
    toilet_bowl: { widthMm: 450, heightMm: 700 },
    bed_double: { widthMm: 1500, heightMm: 2000 },
    bed_single: { widthMm: 1050, heightMm: 1950 },
    nightstand: { widthMm: 450, heightMm: 450 },
    desk: { widthMm: 1100, heightMm: 580 },
    wardrobe: { widthMm: 1300, heightMm: 600 },
    shoe_box: { widthMm: 800, heightMm: 380 },
};

export type FixtureRotation = 0 | 90 | 180 | 270;

/** The item's axis-aligned footprint once rotated (90/270 swap width and height). */
export function fixtureFootprintMm(
    kind: FixtureKind,
    rotation: FixtureRotation,
): { widthMm: number; heightMm: number } {
    const s = FIXTURE_CATALOG[kind];
    return rotation === 90 || rotation === 270
        ? { widthMm: s.heightMm, heightMm: s.widthMm }
        : s;
}

/** Same footprint, rounded up to whole grid cells — used to check a fixture stays inside its
 * room on the same 910mm module the rooms themselves are laid out on. Rounding up is
 * conservative: it never under-reports how much space the item actually needs. */
export function fixtureFootprintCells(
    kind: FixtureKind,
    rotation: FixtureRotation,
    gridMm = 910,
): { wCells: number; hCells: number } {
    const { widthMm, heightMm } = fixtureFootprintMm(kind, rotation);
    return {
        wCells: Math.ceil(widthMm / gridMm),
        hCells: Math.ceil(heightMm / gridMm),
    };
}
