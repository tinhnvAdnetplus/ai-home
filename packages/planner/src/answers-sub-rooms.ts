import {
    safeGetFirst,
    safeGetString,
    safeGetStringArray,
} from './answers-readers.js';
import { parseNumericUnit, m2ToTsubo } from './answers-units.js';
import {
    TARGET_AREA_RANGE_TABLE,
    LDK_SIZE_TABLE,
    MASTER_SIZE_TABLE,
    KIDS_ROOM_COUNT_TABLE,
    KIDS_ROOM_SIZE_TABLE,
    TATAMI_COUNT_TABLE,
    TATAMI_SIZE_TABLE,
} from './answers-tables.js';
import { type Issue } from './answers-types.js';

export function mapBuildingRoomsAnswers(
    rec: Record<string, unknown>,
    issues: Issue[],
): {
    targetArea: number;
    ldkSize: number;
    masterSize: number;
    kidsRooms: number;
    kidsSize: number;
    tatamiRoom: string;
} {
    const rawTarget = safeGetFirst(rec, [
        'building.targetArea',
        'plan_target_area',
        'targetArea',
    ]);
    const parsedTarget = parseNumericUnit(rawTarget);
    let targetAreaVal = 32;
    if (parsedTarget !== undefined) {
        targetAreaVal =
            parsedTarget.unit === 'm2'
                ? m2ToTsubo(parsedTarget.value)
                : parsedTarget.value;
    } else {
        const rawRange = safeGetString(rec, ['target_area_range'], '');
        targetAreaVal = TARGET_AREA_RANGE_TABLE[rawRange] ?? 32;
        issues.push({
            path: ['targetArea'],
            code: 'TARGET_AREA_FROM_RANGE',
            message: `Target area set to ${String(targetAreaVal)} tsubo`,
            level: 'info',
        });
    }
    const targetArea = Math.min(150, Math.max(15, targetAreaVal));

    const rawLdk = safeGetString(
        rec,
        ['building.ldkSize', 'plan_ldk_size', 'ldkSize'],
        'size_18',
    );
    const ldkSize = Math.min(40, Math.max(10, LDK_SIZE_TABLE[rawLdk] ?? 18));

    const rawMaster = safeGetString(
        rec,
        ['building.masterSize', 'plan_master_bedroom_size', 'masterSize'],
        'size_8',
    );
    const masterSize = Math.min(
        20,
        Math.max(4, MASTER_SIZE_TABLE[rawMaster] ?? 8),
    );

    const rawKidsVal = safeGetFirst(rec, [
        'building.kidsRooms',
        'plan_kids_room_count',
        'kidsRooms',
    ]);
    let kidsRooms = 2;
    if (typeof rawKidsVal === 'number' && Number.isFinite(rawKidsVal)) {
        kidsRooms = Math.min(4, Math.max(0, rawKidsVal));
    } else {
        const rawKids = typeof rawKidsVal === 'string' ? rawKidsVal : 'count_2';
        kidsRooms = Math.min(
            4,
            Math.max(0, KIDS_ROOM_COUNT_TABLE[rawKids] ?? 2),
        );
    }

    const rawKidsSize = safeGetString(
        rec,
        ['building.kidsSize', 'plan_kids_room_size', 'kidsSize'],
        'size_6',
    );
    const kidsSize = Math.min(
        15,
        Math.max(3, KIDS_ROOM_SIZE_TABLE[rawKidsSize] ?? 6),
    );

    const rawTatamiCount = safeGetString(rec, ['plan_tatami_count'], 'count_0');
    const tatamiCount = TATAMI_COUNT_TABLE[rawTatamiCount] ?? 0;
    const lifeSpaces = safeGetStringArray(rec, ['life_spaces']);
    let tatamiRoom = 'なし';
    if (tatamiCount > 0 || lifeSpaces.includes('tatami')) {
        const rawTatamiSize = safeGetString(
            rec,
            ['plan_tatami_size'],
            'size_3_4_5',
        );
        tatamiRoom = TATAMI_SIZE_TABLE[rawTatamiSize] ?? 'リビング続き4.5帖';
    }

    return { targetArea, ldkSize, masterSize, kidsRooms, kidsSize, tatamiRoom };
}
