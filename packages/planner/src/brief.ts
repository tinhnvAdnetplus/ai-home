import { type PlanInput } from './types.js';
import { ENUM_KNOBS, LIST_KNOBS, NUMERIC_KNOBS } from './brief-knobs.js';

/** One change to the customer's program, with the reason the customer will read. */
export type BriefAdjustment = {
    readonly action: 'set' | 'remove' | 'add';
    readonly field: string;
    /** new value for `set`; the option name for `remove` / `add` */
    readonly value: string;
    /** the customer's wish this touches, in their words (Japanese) */
    readonly wish: string;
    /** why, written for the customer (Japanese) */
    readonly reason: string;
    /** 'ai' = chosen by the AI, 'rule' = rule-based fallback, 'input' = a correction of the entered data */
    readonly source: 'ai' | 'rule' | 'input';
};

export type AppliedAdjustment = BriefAdjustment & {
    /** the value before, as shown to the customer */
    readonly from: string;
};

type KnobValue = number | string | readonly string[];

const READ: Readonly<Record<string, (p: PlanInput) => KnobValue | undefined>> =
    {
        floors: (p) => p.floors,
        targetArea: (p) => p.targetArea,
        ldkSize: (p) => p.ldkSize,
        masterSize: (p) => p.masterSize,
        kidsRooms: (p) => p.kidsRooms,
        kidsSize: (p) => p.kidsSize,
        cars: (p) => p.cars,
        landAreaTsubo: (p) => p.landAreaTsubo,
        tatamiRoom: (p) => p.tatamiRoom,
        parkingType: (p) => p.parkingType,
        extraRooms: (p) => p.extraRooms,
        waterOpts: (p) => p.waterOpts,
        storageOpts: (p) => p.storageOpts,
        outdoorOpts: (p) => p.outdoorOpts,
    };

/** Returns `o` with one knob set; values were validated against the knob tables first. */
function write(
    o: Partial<PlanInput>,
    field: string,
    v: KnobValue,
): Partial<PlanInput> {
    if (typeof v === 'number') {
        switch (field) {
            case 'floors':
                return { ...o, floors: v === 1 ? 1 : 2 };
            case 'targetArea':
                return { ...o, targetArea: v };
            case 'ldkSize':
                return { ...o, ldkSize: v };
            case 'masterSize':
                return { ...o, masterSize: v };
            case 'kidsRooms':
                return { ...o, kidsRooms: v };
            case 'kidsSize':
                return { ...o, kidsSize: v };
            case 'cars':
                return { ...o, cars: v };
            case 'landAreaTsubo':
                return { ...o, landAreaTsubo: v };
            default:
                return o;
        }
    }
    if (typeof v === 'string') {
        if (field === 'tatamiRoom') return { ...o, tatamiRoom: v };
        if (field === 'parkingType') return { ...o, parkingType: v };
        return o;
    }
    switch (field) {
        case 'extraRooms':
            return { ...o, extraRooms: v };
        case 'waterOpts':
            return { ...o, waterOpts: v };
        case 'storageOpts':
            return { ...o, storageOpts: v };
        case 'outdoorOpts':
            return { ...o, outdoorOpts: v };
        default:
            return o;
    }
}

function show(v: KnobValue | undefined): string {
    if (v === undefined) return '—';
    if (typeof v === 'object') return v.length > 0 ? v.join('・') : 'なし';
    return v.toString();
}

/**
 * Checks each change against the knobs and applies the valid ones to `program` (the program
 * after constraints and any earlier overrides). Returns the overrides to hand the planner.
 */
export function applyAdjustments(
    program: PlanInput,
    adjustments: readonly BriefAdjustment[],
): {
    readonly overrides: Partial<PlanInput>;
    readonly applied: readonly AppliedAdjustment[];
    readonly rejected: readonly { adjustment: BriefAdjustment; why: string }[];
} {
    let out: Partial<PlanInput> = {};
    const applied: AppliedAdjustment[] = [];
    const rejected: { adjustment: BriefAdjustment; why: string }[] = [];

    for (const adj of adjustments) {
        const read = READ[adj.field];
        const before = read ? read({ ...program, ...out }) : undefined;
        const num = NUMERIC_KNOBS[adj.field];
        const enumVals = ENUM_KNOBS[adj.field];
        const listVals = LIST_KNOBS[adj.field];
        let next: KnobValue | null = null;
        let why = `変更できない項目 ${adj.action}:${adj.field}`;
        if (adj.action === 'set' && num) {
            const n = Number(adj.value);
            if (Number.isFinite(n) && n >= num.min && n <= num.max)
                next = num.isInt ? Math.round(n) : n;
            else why = `範囲外 ${adj.value}`;
        } else if (adj.action === 'set' && enumVals) {
            if (enumVals.includes(adj.value)) next = adj.value;
            else why = `未対応の値 ${adj.value}`;
        } else if (adj.action !== 'set' && listVals) {
            const list = typeof before === 'object' ? before : [];
            if (!listVals.includes(adj.value))
                why = `未対応の項目 ${adj.value}`;
            else if (adj.action === 'remove')
                next = list.filter((x) => x !== adj.value);
            else if (!list.includes(adj.value)) next = [...list, adj.value];
            else next = list;
        }
        if (next === null) {
            rejected.push({ adjustment: adj, why });
            continue;
        }
        if (show(next) === show(before)) continue;
        out = write(out, adj.field, next);
        applied.push({ ...adj, from: show(before) });
    }
    return { overrides: out, applied, rejected };
}

/** What the review may change, in the form the AI reads. */
export function describeKnobs(): Record<string, unknown> {
    return { numeric: NUMERIC_KNOBS, enums: ENUM_KNOBS, lists: LIST_KNOBS };
}
