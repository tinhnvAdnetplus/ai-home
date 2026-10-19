import { type CostBreakdownItem } from './plan-cost-types';

type BreakdownParams = {
    readonly honntai: number;
    readonly optTotal: number;
    readonly futai: number;
    readonly shohi: number;
    readonly total: number;
    readonly basePrice: number;
    readonly tsubo: number;
    readonly optionCount: number;
};

export function buildCostBreakdown({
    honntai,
    optTotal,
    futai,
    shohi,
    total,
    basePrice,
    tsubo,
    optionCount,
}: BreakdownParams): readonly CostBreakdownItem[] {
    return [
        {
            id: 'honntai',
            nameKey: 'plan:costHonntai',
            nameDefault: '本体工事費',
            value: honntai,
            percent: Math.round((honntai / total) * 100),
            note: `${Math.round(basePrice).toString()}万円/坪 × ${tsubo.toFixed(1)}坪`,
            color: '#0b6bdc',
        },
        {
            id: 'options',
            nameKey: 'plan:costOptions',
            nameDefault: 'オプション工事費',
            value: optTotal,
            percent: Math.round((optTotal / total) * 100),
            note: `${optionCount.toString()}項目`,
            color: '#10b981',
        },
        {
            id: 'futai',
            nameKey: 'plan:costFutai',
            nameDefault: '付帯工事費',
            value: futai,
            percent: Math.round((futai / total) * 100),
            note: '地盤改良・給排水・外構・仮設 ほか',
            color: '#f59e0b',
        },
        {
            id: 'shohi',
            nameKey: 'plan:costShohi',
            nameDefault: '諸費用',
            value: shohi,
            percent: Math.round((shohi / total) * 100),
            note: '設計料・確認申請・登記・各種保険 ほか',
            color: '#6366f1',
        },
    ];
}
