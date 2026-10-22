import {
    type BdmIssue,
    type Floor,
    type Opening,
    type Rect2,
    type Wall,
    GEOMETRY_TOLERANCE_MM,
    wallLengthMm,
    wallSolidRect,
} from '@aihome/bdm';

/** Shared state, constants and helpers of the solid checks (see solid-validator.ts). */

/** Clear zone in front of a sliding door (no swing; just room to step through). */
export const SLIDING_DOOR_CLEAR_DEPTH_MM = 300;
/** Cap for a swing-door leaf radius used as its swing zone depth. */
export const MAX_SWING_DEPTH_MM = 900;
/** Overlap below this (mm²) is treated as numerical noise (1mm x 100mm). */
export const AREA_TOL_MM2 = 100;
export const TOL = GEOMETRY_TOLERANCE_MM;

/** Findings that rest on an assumption rather than on stored data are reported as 'info'. */
export const ASSUMPTION_CODES: ReadonlySet<string> = new Set([
    'SOLID_FIXTURE_IN_DOOR_ZONE',
]);

export const FIXTURE_LABELS: Readonly<Record<string, string>> = {
    kitchen_counter: 'キッチン',
    kitchen_island: 'アイランドキッチン',
    kitchen_l: 'L型キッチン',
    fridge: '冷蔵庫',
    dining_table_4: 'ダイニングテーブル',
    dining_table_6: 'ダイニングテーブル',
    sofa: 'ソファ',
    sofa_l: 'L型ソファ',
    low_table: 'ローテーブル',
    tv_board: 'テレビボード',
    bathtub: '浴槽',
    vanity: '洗面台',
    washing_machine: '洗濯機',
    toilet_bowl: '便器',
    bed_double: 'ダブルベッド',
    bed_single: 'シングルベッド',
    nightstand: 'ナイトテーブル',
    desk: 'デスク',
    wardrobe: 'ワードローブ',
    shoe_box: '下足入れ',
};

export const label = (kind: string): string => FIXTURE_LABELS[kind] ?? kind;

export type SolidFinding = {
    readonly code: string;
    readonly level: 'warn' | 'info';
    readonly floorLevel: number | null;
    readonly objectIds: readonly string[];
    /** Penetration depth or gap (mm) where meaningful. */
    readonly depthMm?: number | undefined;
    readonly detail: string;
};

export type SolidValidationReport = {
    readonly findings: readonly SolidFinding[];
    /** Findings grouped per code+floor, ready to append to `Plan.warnings` ('warn'/'info'). */
    readonly issues: readonly BdmIssue[];
    /** Number of permitted contacts that were verified (wall-slab, junctions, openings, ...). */
    readonly allowedContacts: number;
    /** What could not be validated with the available data. */
    readonly incomplete: readonly string[];
    /** Always true: checks use footprints + storey Z ranges, not mesh intersection. */
    readonly isApproximate: true;
};

export type FixtureSolid = {
    readonly id: string;
    readonly kind: string;
    readonly rect: Rect2;
};

export type Ctx = {
    readonly findings: SolidFinding[];
    readonly incomplete: Set<string>;
    allowed: number;
};

export function add(
    ctx: Ctx,
    code: string,
    floor: Floor | null,
    objectIds: readonly string[],
    detail: string,
    depthMm?: number,
): void {
    ctx.findings.push({
        code,
        level: ASSUMPTION_CODES.has(code) ? 'info' : 'warn',
        floorLevel: floor?.level ?? null,
        objectIds,
        depthMm: depthMm === undefined ? undefined : Math.round(depthMm),
        detail,
    });
}

/** Plan rectangle of an opening slot along its host wall (host thickness wide). */
export function openingRect(wall: Wall, op: Opening): Rect2 | null {
    const len = wallLengthMm(wall);
    const r = wallSolidRect(wall, {
        startMm: Math.max(0, op.offsetMm),
        endMm: Math.min(len, op.offsetMm + op.widthMm),
    });
    return r;
}
