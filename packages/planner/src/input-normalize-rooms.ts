import {
    EXTRA_ROOM_KEYS,
    addUnique,
    removeUnique,
    getString,
    getStringArray,
} from './input-presets.js';

export function normalizeRoomOptions(
    rec: Record<string, unknown>,
    preset: {
        storageOpts: readonly string[];
        shoesCloset: string;
    },
    storageLevel: string,
    roomTypes: readonly string[],
    mustHave: readonly string[],
    notNeeded: readonly string[],
    wfh: string,
): {
    tatamiRoom: string;
    extraRooms: readonly string[];
    storageOpts: readonly string[];
    waterOpts: readonly string[];
    outdoorOpts: readonly string[];
    shoesCloset: string;
    kitchenType: string;
    equipOpts: readonly string[];
    evCharger: string;
    solar: string;
} {
    let tatamiRoom = getString(
        rec['rooms.tatamiRoom'] ?? rec.tatamiRoom ?? rec.japaneseRoom,
        roomTypes.includes('和室') ? 'リビング続き4.5帖' : 'なし',
    );
    if (mustHave.includes('和室') && tatamiRoom === 'なし') {
        tatamiRoom = 'リビング続き4.5帖';
    }
    if (notNeeded.includes('和室')) {
        tatamiRoom = 'なし';
    }

    let extraRooms = getStringArray(
        rec['rooms.extraRooms'] ?? rec.extraRooms,
        EXTRA_ROOM_KEYS.filter((k) => roomTypes.includes(k)),
    );
    if (wfh === '書斎が必要' || mustHave.includes('書斎'))
        extraRooms = addUnique(extraRooms, '書斎');
    if (mustHave.includes('土間収納'))
        extraRooms = addUnique(extraRooms, '土間収納');
    if (mustHave.includes('吹き抜け'))
        extraRooms = addUnique(extraRooms, '吹き抜け');
    if (notNeeded.includes('客間'))
        extraRooms = removeUnique(extraRooms, '客間');
    if (notNeeded.includes('書斎') && !mustHave.includes('書斎'))
        extraRooms = removeUnique(extraRooms, '書斎');

    let storageOpts = getStringArray(
        rec['rooms.storageOpts'] ?? rec.storageOpts,
        preset.storageOpts,
    );
    if (mustHave.includes('ファミリークローゼット'))
        storageOpts = addUnique(storageOpts, 'ファミリークローゼット');
    if (notNeeded.includes('納戸'))
        storageOpts = removeUnique(storageOpts, '納戸');

    let waterOpts = getStringArray(rec['rooms.waterOpts'] ?? rec.waterOpts, [
        'ランドリールーム',
        'パントリー',
    ]);
    if (storageLevel === '大容量希望' || mustHave.includes('パントリー'))
        waterOpts = addUnique(waterOpts, 'パントリー');
    if (mustHave.includes('ランドリールーム'))
        waterOpts = addUnique(waterOpts, 'ランドリールーム');
    if (notNeeded.includes('2階洗面'))
        waterOpts = removeUnique(waterOpts, '2階洗面');

    let outdoorOpts = getStringArray(
        rec['site.outdoorOpts'] ?? rec.outdoorOpts,
        ['ウッドデッキ', '庭・植栽'],
    );
    if (mustHave.includes('ウッドデッキ'))
        outdoorOpts = addUnique(outdoorOpts, 'ウッドデッキ');
    if (mustHave.includes('広い玄関'))
        outdoorOpts = addUnique(outdoorOpts, '玄関ポーチ拡張');

    let shoesCloset = getString(
        rec['rooms.shoesCloset'] ?? rec.shoesCloset,
        preset.shoesCloset,
    );
    if (mustHave.includes('土間収納')) shoesCloset = 'ウォークスルー';

    let kitchenType = getString(
        rec['rooms.kitchenType'] ?? rec.kitchenType,
        '対面',
    );
    if (mustHave.includes('アイランドキッチン')) kitchenType = 'アイランド';

    let equipOpts = getStringArray(rec['equip.opts'] ?? rec.equipOpts, []);
    const evCharger = getString(
        rec['parking.evCharger'] ?? rec.evCharger,
        'なし',
    );
    const solar = getString(rec['performance.solar'] ?? rec.solar, '希望');
    if (evCharger === 'あり') equipOpts = addUnique(equipOpts, 'EV充電');
    if (solar !== '不要') equipOpts = addUnique(equipOpts, '太陽光発電');

    return {
        tatamiRoom,
        extraRooms,
        storageOpts,
        waterOpts,
        outdoorOpts,
        shoesCloset,
        kitchenType,
        equipOpts,
        evCharger,
        solar,
    };
}
