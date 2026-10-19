import {
    safeGetFirst,
    safeGetString,
    safeGetStringArray,
} from './answers-readers.js';
import {
    BATH_SIZE_TABLE,
    TOILETS_COUNT_TABLE,
    KITCHEN_TYPE_TABLE,
} from './answers-tables.js';

export function mapWetZoneAnswers(
    rec: Record<string, unknown>,
    floors: 1 | 2,
): {
    toilets: number;
    bathSize: '1坪' | '1.25坪' | '1.5坪';
    bathFloor: '1階' | '2階';
    washCount: number;
    waterOpts: readonly string[];
    kitchenType: string;
} {
    const rawToilets = safeGetString(
        rec,
        ['rooms.toilets', 'plan_toilet', 'toilets'],
        floors === 1 ? 'one_floor' : 'two_floors',
    );
    const toilets = Math.min(
        4,
        Math.max(1, TOILETS_COUNT_TABLE[rawToilets] ?? (floors === 1 ? 1 : 2)),
    );

    const rawBath = safeGetString(
        rec,
        ['rooms.bathSize', 'plan_bath', 'bathSize'],
        'size_1_0',
    );
    const bathSize = BATH_SIZE_TABLE[rawBath] ?? '1坪';

    const rawBathFloor = safeGetString(
        rec,
        ['rooms.bathFloor', 'bathFloor'],
        '1階',
    );
    const bathFloor: '1階' | '2階' = rawBathFloor === '2階' ? '2階' : '1階';

    const rawWash = safeGetFirst(rec, [
        'rooms.washCount',
        'plan_washroom',
        'washCount',
    ]);
    const rawWashStr = typeof rawWash === 'string' ? rawWash : '';
    let washCount =
        typeof rawWash === 'number' ? Math.min(4, Math.max(1, rawWash)) : 1;
    if (rawWashStr === 'two' || rawWashStr === 'size_2') washCount = 2;

    const rawKit = safeGetString(
        rec,
        ['rooms.kitchenType', 'plan_kitchen', 'kitchenType'],
        'counter',
    );
    const kitchenType = KITCHEN_TYPE_TABLE[rawKit] ?? '対面';

    const waterOpts = ['パントリー'];
    if (rawWashStr === 'size_2') waterOpts.push('脱衣室分離');
    const lifeFlow = safeGetStringArray(rec, ['life_flow']);
    if (lifeFlow.includes('short_laundry_flow'))
        waterOpts.push('ランドリールーム');

    return { toilets, bathSize, bathFloor, washCount, waterOpts, kitchenType };
}
