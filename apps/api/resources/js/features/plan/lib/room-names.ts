import { type TFunction } from 'i18next';

const ROOM_KEY_MAP = {
    ldk: 'plan:rooms.ldk',
    living: 'plan:rooms.living',
    dining: 'plan:rooms.dining',
    kitchen: 'plan:rooms.kitchen',
    bedroom: 'plan:rooms.bedroom',
    masterbedroom: 'plan:rooms.bedroom',
    childroom: 'plan:rooms.childRoom',
    kidsroom: 'plan:rooms.childRoom',
    washitsu: 'plan:rooms.washitsu',
    japanese: 'plan:rooms.washitsu',
    tatami: 'plan:rooms.washitsu',
    bath: 'plan:rooms.bath',
    bathroom: 'plan:rooms.bath',
    wash: 'plan:rooms.wash',
    washroom: 'plan:rooms.wash',
    toilet: 'plan:rooms.toilet',
    wc: 'plan:rooms.toilet',
    entrance: 'plan:rooms.entrance',
    entry: 'plan:rooms.entrance',
    hall: 'plan:rooms.hall',
    corridor: 'plan:rooms.corridor',
    stairs: 'plan:rooms.stairs',
    stair: 'plan:rooms.stairs',
    storage: 'plan:rooms.storage',
    closet: 'plan:rooms.closet',
    walkincloset: 'plan:rooms.walkInCloset',
    wic: 'plan:rooms.walkInCloset',
    pantry: 'plan:rooms.pantry',
    laundry: 'plan:rooms.laundry',
    study: 'plan:rooms.study',
    balcony: 'plan:rooms.balcony',
    void: 'plan:rooms.void',
    guest: 'plan:rooms.guest',
    hobby: 'plan:rooms.hobby',
    porch: 'plan:rooms.porch',
    deck: 'plan:rooms.deck',
    elevator: 'plan:rooms.elevator',
    sic: 'plan:rooms.sic',
    shoesincloset: 'plan:rooms.sic',
    shoescloset: 'plan:rooms.sic',
    // Japanese aliases
    主寝室: 'plan:rooms.bedroom',
    寝室: 'plan:rooms.bedroom',
    子ども部屋: 'plan:rooms.childRoom',
    子供部屋: 'plan:rooms.childRoom',
    和室: 'plan:rooms.washitsu',
    浴室: 'plan:rooms.bath',
    お風呂: 'plan:rooms.bath',
    洗面所: 'plan:rooms.wash',
    洗面脱衣室: 'plan:rooms.wash',
    洗面: 'plan:rooms.wash',
    トイレ: 'plan:rooms.toilet',
    玄関: 'plan:rooms.entrance',
    ホール: 'plan:rooms.hall',
    廊下: 'plan:rooms.corridor',
    階段: 'plan:rooms.stairs',
    収納: 'plan:rooms.storage',
    クローゼット: 'plan:rooms.closet',
    ウォークインクローゼット: 'plan:rooms.walkInCloset',
    パントリー: 'plan:rooms.pantry',
    ランドリールーム: 'plan:rooms.laundry',
    書斎: 'plan:rooms.study',
    バルコニー: 'plan:rooms.balcony',
    吹き抜け: 'plan:rooms.void',
    客間: 'plan:rooms.guest',
    趣味室: 'plan:rooms.hobby',
    ポーチ: 'plan:rooms.porch',
    ウッドデッキ: 'plan:rooms.deck',
    エレベーター: 'plan:rooms.elevator',
    シューズクローク: 'plan:rooms.sic',
} as const;

type RoomKey = keyof typeof ROOM_KEY_MAP;

function isRoomKey(key: string): key is RoomKey {
    return Object.prototype.hasOwnProperty.call(ROOM_KEY_MAP, key);
}

export function localizeRoomName(raw: string, t: TFunction): string {
    const trimmed = raw.trim();
    const normalized = trimmed.toLowerCase().replace(/[-_\s]/g, '');
    if (isRoomKey(normalized)) {
        const transKey = ROOM_KEY_MAP[normalized];
        const translated: unknown = t(transKey);
        if (typeof translated === 'string' && translated !== transKey) {
            return translated;
        }
    }
    return trimmed;
}
