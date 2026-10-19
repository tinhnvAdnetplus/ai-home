/**
 * Rates and constants for plan cost estimation (rough estimate / 概算費用).
 * Configurable unit prices, multipliers, and default loan values.
 */

export const UNIT_PRICE_RATES: Record<string, number> = {
    スタンダード: 78,
    ハイグレード: 95,
    プレミアム: 115,
};

export const DEFAULT_UNIT_PRICE = 78;

export const STRUCTURE_MULTIPLIERS: Record<string, number> = {
    木造軸組: 1.0,
    '2×4': 1.02,
    鉄骨造: 1.18,
    RC造: 1.38,
};

export const ROOF_MULTIPLIERS: Record<string, number> = {
    切妻: 1.0,
    寄棟: 1.03,
    片流れ: 0.99,
    陸屋根: 1.05,
};

export interface CostOptionRate {
    readonly key: string;
    readonly label: string;
    readonly cost: number;
    readonly answerCategory?: string | undefined;
}

export const OPTION_RATES: readonly CostOptionRate[] = [
    { key: '太陽光発電', label: '太陽光発電システム（4.5kW）', cost: 145 },
    { key: '蓄電池', label: '蓄電池（7kWh）', cost: 135 },
    { key: 'ZEH', label: 'ZEH仕様（断熱・設備強化）', cost: 120 },
    { key: '床暖房', label: '床暖房（LDK）', cost: 65 },
    { key: '全館空調', label: '全館空調システム', cost: 180 },
    { key: 'EV充電', label: 'EV充電コンセント', cost: 12 },
    { key: 'スマートホーム', label: 'IoT・スマートホーム', cost: 38 },
    { key: 'バリアフリー', label: 'バリアフリー対応', cost: 45 },
    { key: '長期優良住宅', label: '長期優良住宅の認定申請', cost: 28 },
    { key: 'ウッドデッキ', label: 'ウッドデッキ・テラス', cost: 42 },
    { key: '庭・植栽', label: '庭・植栽工事', cost: 55 },
    { key: '物置', label: '物置・外部収納', cost: 18 },
    { key: 'クローズ外構', label: 'クローズ外構（門・塀）', cost: 95 },
    { key: '駐輪スペース', label: '駐輪スペース', cost: 12 },
    { key: '玄関ポーチ拡張', label: '広い玄関ポーチ', cost: 22 },
    { key: 'ホームエレベーター', label: 'ホームエレベーター', cost: 350 },
    { key: '吹き抜け', label: '吹き抜け（構造・空調対応）', cost: 78 },
    { key: '小屋裏収納', label: '小屋裏収納・固定階段', cost: 58 },
    { key: '床下収納', label: '床下収納', cost: 8 },
];

export const INSULATION_RATES: Record<string, number> = {
    等級5: 0,
    等級6: 55,
    等級7: 130,
};

export const SEISMIC_RATES: Record<string, number> = {
    等級1: 0,
    等級2: 32,
    等級3: 62,
};

export const PARKING_RATES: Record<string, number> = {
    なし: 0,
    カーポート: 48,
    ビルトイン: 210,
};

export const ANCILLARY_WORK_RATIO = 0.16; // 付帯工事費 (地盤改良・給排水・外構基本・仮設)
export const MISC_EXPENSES_RATIO = 0.075; // 諸費用 (設計料・確認申請・登記・保険・ローン費用)

export const DEFAULT_LOAN_PARAMS = {
    downMan: 300,
    ratePercent: 0.7,
    years: 35,
} as const;
