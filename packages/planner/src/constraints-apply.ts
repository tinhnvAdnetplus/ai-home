import { type PlanInput } from './types.js';
import { type DesignConstraints } from './constraints.js';
import { addUnique, applyMustHaveAndAvoidRooms } from './constraints-rooms.js';

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

export type AppliedConstraintsResult = {
    readonly input: PlanInput;
    readonly applied: readonly string[];
    readonly unsatisfied: readonly string[];
    readonly weights: {
        housework: number;
        storage: number;
        daylight: number;
        budget: number;
    };
    readonly preferredVariantOrder: readonly ('A' | 'B' | 'C')[];
};

export function applyDesignConstraints(
    base: PlanInput,
    c: DesignConstraints,
): AppliedConstraintsResult {
    let inp = { ...base };
    const applied: string[] = [];
    const unsatisfied: string[] = [];

    // 1. Priorities to scoring weights and variant ordering
    const p = c.priorities;
    const rawH = 0.15 + (p.housework / 5) * 0.35;
    const rawS = 0.15 + (p.storage / 5) * 0.35;
    const rawD = 0.15 + (p.daylight / 5) * 0.35;
    const rawB = 0.15 + (p.budget / 5) * 0.35;
    const sum = rawH + rawS + rawD + rawB;
    const weights = {
        housework: rawH / sum,
        storage: rawS / sum,
        daylight: rawD / sum,
        budget: rawB / sum,
    };
    applied.push('PRIORITY_WEIGHTS_NORMALIZED');

    const scA = p.housework * 1.5 + p.storage * 1.2 + p.family * 1.0;
    const scB = p.daylight * 1.5 + p.privacy * 1.0;
    const scC = p.budget * 1.5;
    const varScores = [
        { id: 'A' as const, sc: scA },
        { id: 'B' as const, sc: scB },
        { id: 'C' as const, sc: scC },
    ];
    varScores.sort((x, y) => y.sc - x.sc);
    const preferredVariantOrder = varScores.map((x) => x.id);

    // 2. Must-have & avoid rooms
    inp = applyMustHaveAndAvoidRooms(inp, c, applied, unsatisfied);

    // 3. Room hints
    for (const h of c.roomHints) {
        const rName = h.room.toLowerCase();
        if (rName.includes('ldk') && h.sizeJo) {
            inp = { ...inp, ldkSize: clamp(h.sizeJo, 12, 30) };
            applied.push(`ROOM_HINT:ldk_size_${h.sizeJo.toString()}`);
        } else if (rName.includes('master') && h.sizeJo) {
            inp = { ...inp, masterSize: clamp(h.sizeJo, 6, 14) };
            applied.push(`ROOM_HINT:master_size_${h.sizeJo.toString()}`);
        } else if (rName.includes('kid')) {
            if (h.count !== undefined) {
                inp = { ...inp, kidsRooms: clamp(h.count, 0, 4) };
                applied.push(`ROOM_HINT:kids_count_${h.count.toString()}`);
            }
            if (h.sizeJo !== undefined) {
                inp = { ...inp, kidsSize: clamp(h.sizeJo, 4.5, 8) };
                applied.push(`ROOM_HINT:kids_size_${h.sizeJo.toString()}`);
            }
        }
    }

    // 4. Pets & WFH & Accessibility
    if (c.pets) {
        inp = {
            ...inp,
            shoesCloset: 'ウォークスルー',
            extraRooms: addUnique(inp.extraRooms, '土間収納'),
        };
        applied.push('PETS_STORAGE_ADDED');
    }
    if (c.workFromHome) {
        inp = {
            ...inp,
            wfh: '書斎が必要',
            extraRooms: addUnique(inp.extraRooms, '書斎'),
        };
        applied.push('WORK_FROM_HOME_STUDY_ADDED');
    }
    if (c.accessibility.oneLevelLiving) {
        inp = { ...inp, bathFloor: '1階' };
        applied.push('ACCESSIBILITY:oneLevelLiving');
    }
    if (c.accessibility.wideCorridors)
        applied.push('ACCESSIBILITY:wideCorridors');
    if (c.orientation.livingFacing !== 'any')
        applied.push(`ORIENTATION:living_${c.orientation.livingFacing}`);
    if (c.orientation.entranceSide !== 'any')
        applied.push(`ORIENTATION:entry_${c.orientation.entranceSide}`);

    return { input: inp, applied, unsatisfied, weights, preferredVariantOrder };
}
