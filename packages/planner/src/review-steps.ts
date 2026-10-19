import { type PlanInput } from './types.js';
import { type DesignConstraints } from './constraints.js';
import { type BriefAdjustment } from './brief.js';
import { type FeasibilityReport } from './feasibility.js';

export type ReviewOptions = {
    /** the customer chose both one and two storeys in different steps */
    readonly isFloorsFlexible?: boolean | undefined;
};

type Step = (
    p: PlanInput,
    r: FeasibilityReport,
    c: DesignConstraints | undefined,
    o: ReviewOptions,
) => BriefAdjustment | null;

const has = (r: FeasibilityReport, code: string): boolean =>
    r.issues.some((i) => i.code === code);
const tooBig = (r: FeasibilityReport): boolean =>
    has(r, 'HOUSE_EXCEEDS_LOT') ||
    has(r, 'COVERAGE_EXCEEDED') ||
    has(r, 'FLOOR_RATIO_EXCEEDED');

function rule(
    field: string,
    action: BriefAdjustment['action'],
    value: string,
    wish: string,
    reason: string,
): BriefAdjustment {
    return { action, field, value, wish, reason, source: 'rule' };
}

function dropOption(
    field: 'extraRooms' | 'waterOpts' | 'storageOpts',
    item: string,
): Step {
    return (p, r) => {
        const list = p[field] ?? [];
        if (!tooBig(r) || !list.includes(item)) return null;
        return rule(
            field,
            'remove',
            item,
            item,
            `敷地に収めるため、優先度の低い「${item}」を省きました。`,
        );
    };
}

function shrink(
    field: 'kidsSize' | 'masterSize' | 'ldkSize',
    label: string,
    floor: number,
    stepJo: number,
): Step {
    return (p, r) => {
        const cur = p[field];
        if (!tooBig(r) || cur <= floor) return null;
        const next = Math.max(floor, cur - stepJo);
        return rule(
            field,
            'set',
            next.toString(),
            `${label} ${cur.toString()}帖`,
            `敷地に収めるため、${label}を${cur.toString()}帖から${next.toString()}帖にしました。`,
        );
    };
}

// tried in order, one change at a time, re-checking the lot after each
export const REVIEW_STEPS: readonly Step[] = [
    (p, r) => {
        if (!has(r, 'PARKING_TOO_NARROW')) return null;
        const n = r.lot.carsAcross;
        return rule(
            'cars',
            'set',
            n.toString(),
            `駐車${p.cars.toString()}台`,
            `間口${r.lot.frontageM.toString()}mに並べて置ける車は${n.toString()}台までのため、${n.toString()}台にしました。`,
        );
    },
    (p, r, c, o) => {
        if (!tooBig(r) || p.floors !== 1) return null;
        if (c?.accessibility.oneLevelLiving && o.isFloorsFlexible !== true)
            return null;
        return rule(
            'floors',
            'set',
            '2',
            '平屋',
            '平屋では建物が敷地（建ぺい率）に収まらないため、2階建てにしました。',
        );
    },
    (p, r) => {
        if (!has(r, 'COVERAGE_EXCEEDED') && !has(r, 'FLOOR_RATIO_EXCEEDED'))
            return null;
        const capM2 = Math.min(
            r.lot.maxTotalM2,
            r.lot.maxFootprintM2 * p.floors,
        );
        const cap = Math.floor(capM2 / 3.305785);
        if (cap < 15 || p.targetArea <= cap) return null;
        return rule(
            'targetArea',
            'set',
            cap.toString(),
            `延床${p.targetArea.toString()}坪`,
            `建ぺい率・容積率から、この敷地に建てられる延床は約${cap.toString()}坪までのため、目標を${cap.toString()}坪にしました。`,
        );
    },
    dropOption('extraRooms', '吹き抜け'),
    dropOption('extraRooms', '客間'),
    dropOption('extraRooms', '納戸'),
    dropOption('waterOpts', '2階洗面'),
    dropOption('waterOpts', '脱衣室分離'),
    dropOption('storageOpts', 'ファミリークローゼット'),
    dropOption('waterOpts', 'ランドリールーム'),
    (p, r) => {
        if (!tooBig(r) || !p.tatamiRoom || p.tatamiRoom === 'なし') return null;
        return rule(
            'tatamiRoom',
            'set',
            'なし',
            p.tatamiRoom,
            '敷地に収めるため、和室を省きました（LDKの一角を多目的スペースとして使えます）。',
        );
    },
    dropOption('extraRooms', '書斎'),
    dropOption('waterOpts', 'パントリー'),
    shrink('kidsSize', '子ども部屋', 4.5, 1.5),
    shrink('masterSize', '主寝室', 6, 2),
    shrink('ldkSize', 'LDK', 14, 2),
    (p, r) => {
        if (!tooBig(r) || p.kidsRooms <= 1) return null;
        return rule(
            'kidsRooms',
            'set',
            (p.kidsRooms - 1).toString(),
            `子ども部屋${p.kidsRooms.toString()}室`,
            `敷地に収めるため、子ども部屋を${(p.kidsRooms - 1).toString()}室にしました（将来間仕切りできる広めの1室とする案もあります）。`,
        );
    },
    (p, r) => {
        if (!tooBig(r) || p.cars <= 0 || p.parkingType === 'ビルトイン')
            return null;
        return rule(
            'cars',
            'set',
            (p.cars - 1).toString(),
            `駐車${p.cars.toString()}台`,
            `建物の奥行を確保するため、駐車を${(p.cars - 1).toString()}台にしました。`,
        );
    },
];
