import { safeGetString, safeGetStringArray } from './answers-readers.js';

export function mapStorageAndWfhAnswers(
    rec: Record<string, unknown>,
    floors: 1 | 2,
): {
    storageLevel: string;
    masterCloset: string;
    kidsCloset: string;
    shoesCloset: string;
    storageOpts: readonly string[];
    wfh: string;
    extraRooms: readonly string[];
} {
    const planStorage = safeGetStringArray(rec, ['plan_storage']);
    const storageLevel =
        planStorage.length >= 3
            ? '大容量希望'
            : planStorage.length === 0
              ? '最小限'
              : '標準';

    const masterCloset = planStorage.includes('walkin_closet')
        ? 'ウォークイン'
        : 'クローゼット';
    const kidsCloset =
        storageLevel === '大容量希望' ? 'ウォークイン' : 'クローゼット';
    const shoesCloset = planStorage.includes('shoes_cloak')
        ? 'ウォークスルー'
        : '収納型';

    const storageOpts: string[] = [];
    if (planStorage.includes('under_stairs') && floors === 2)
        storageOpts.push('階段下収納');
    if (storageLevel === '大容量希望')
        storageOpts.push('ファミリークローゼット', '納戸');

    const lifeWork = safeGetString(rec, ['life_work', 'rooms.wfh'], '');
    const studyCount = safeGetString(rec, ['plan_study_count'], 'count_0');
    const studySize = safeGetString(rec, ['plan_study_size'], '');
    const lifeSpaces = safeGetStringArray(rec, ['life_spaces']);

    const isWfh =
        lifeWork === 'dedicated_room' ||
        studyCount !== 'count_0' ||
        studySize !== '' ||
        lifeSpaces.includes('workspace');
    const wfh = isWfh
        ? '書斎が必要'
        : lifeWork === 'living_corner'
          ? 'リビング一角'
          : 'なし';

    const extraRooms: string[] = [];
    if (isWfh) extraRooms.push('書斎');
    if (lifeSpaces.includes('fukinuke')) extraRooms.push('吹き抜け');
    if (planStorage.includes('shoes_cloak')) extraRooms.push('土間収納');
    const lifePets = safeGetStringArray(rec, ['life_pets']);
    if (
        lifePets.some((p) => p !== 'no_pet' && p !== '') &&
        !extraRooms.includes('土間収納')
    )
        extraRooms.push('土間収納');
    const otherCount = safeGetString(rec, ['plan_other_room_count'], 'count_0');
    const otherSize = safeGetString(rec, ['plan_other_room_size'], '');
    if (otherCount !== 'count_0') {
        const guestName = otherSize ? `客間(${otherSize})` : '客間';
        if (!extraRooms.includes(guestName)) extraRooms.push(guestName);
    }

    return {
        storageLevel,
        masterCloset,
        kidsCloset,
        shoesCloset,
        storageOpts,
        wfh,
        extraRooms,
    };
}
