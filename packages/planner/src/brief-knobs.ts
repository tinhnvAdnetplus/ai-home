type NumericKnob = {
    readonly min: number;
    readonly max: number;
    readonly isInt?: boolean;
};

/** Numbers the review may change, with the ranges the planner supports. */
export const NUMERIC_KNOBS: Readonly<Record<string, NumericKnob>> = {
    floors: { min: 1, max: 2, isInt: true },
    targetArea: { min: 15, max: 150 },
    ldkSize: { min: 10, max: 40 },
    masterSize: { min: 4.5, max: 20 },
    kidsRooms: { min: 0, max: 6, isInt: true },
    kidsSize: { min: 4.5, max: 15 },
    cars: { min: 0, max: 4, isInt: true },
    landAreaTsubo: { min: 10, max: 500 },
};

/** Fields with a fixed set of values. */
export const ENUM_KNOBS: Readonly<Record<string, readonly string[]>> = {
    tatamiRoom: ['なし', 'リビング続き4.5帖', 'リビング続き6帖', '和室8帖'],
    parkingType: ['青空', 'カーポート', 'ビルトイン'],
};

/** Option lists the review may add to or remove from (names the planner understands). */
export const LIST_KNOBS: Readonly<Record<string, readonly string[]>> = {
    extraRooms: ['書斎', '吹き抜け', '土間収納', '客間', '納戸'],
    waterOpts: ['ランドリールーム', 'パントリー', '2階洗面', '脱衣室分離'],
    storageOpts: ['ファミリークローゼット', '階段下収納'],
    outdoorOpts: ['ウッドデッキ', '庭・植栽'],
};
