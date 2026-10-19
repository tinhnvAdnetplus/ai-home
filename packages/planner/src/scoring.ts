import { type GridRoom, type PlanScore } from './types.js';
import { type InternalPlanValues } from './program-types.js';
import { type PlannerConfig } from './config.js';
import { rectsTouchSun } from './sun-side.js';

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function estimateCost(
    tsubo: number,
    v: InternalPlanValues,
    config: PlannerConfig,
): number {
    let base = config.unitPricePerTsubo.standard;
    const structCoeff =
        config.structureCoefficients[v.structure ?? '木造軸組'] ?? 1.0;
    const roofCoeff = config.roofCoefficients[v.roofType ?? '切妻'] ?? 1.0;
    base = base * structCoeff * roofCoeff;

    if (tsubo < 28) base *= 1.07;
    else if (tsubo > 48) base *= 0.97;
    if (v.floors === 1) base *= 1.06;

    const honntai = tsubo * base;
    let optTotal = 0;
    if (v.solar !== '不要') optTotal += 145;
    if (v.parkingType === 'ビルトイン') optTotal += 210 * Math.max(1, v.cars);
    else if (v.parkingType === 'カーポート') optTotal += 48;
    if (v.bathFloor === '2階') optTotal += 48;
    if (v.toilets >= 2) optTotal += 32 * (v.toilets - 1);
    if (has(v.waterOpts, '2階洗面')) optTotal += 26;
    if (has(v.outdoorOpts, 'ウッドデッキ')) optTotal += 42;
    if (has(v.outdoorOpts, '庭・植栽')) optTotal += 55;
    if (has(v.extraRooms, '吹き抜け')) optTotal += 78;

    const futai = honntai * 0.16;
    const shohi = honntai * 0.075;
    return honntai + optTotal + futai + shohi;
}

export function scorePlan(
    allRooms: readonly GridRoom[],
    totalM2: number,
    gridW: number,
    gridD: number,
    v: InternalPlanValues,
    costTotal: number,
    config: PlannerConfig,
    customWeights?: {
        housework: number;
        storage: number;
        daylight: number;
        budget: number;
    },
): PlanScore {
    let storage = 0;
    let ldk: GridRoom | null = null;
    const water: GridRoom[] = [];
    let hall = 0;

    for (const r of allRooms) {
        if (r.type === 'closet' || r.type === 'storage' || r.type === 'pantry')
            storage += r.m2;
        // rule plans key the LDK 'ldk'; AI layouts use their own keys (ldk8…)
        if (r.type === 'ldk' && (ldk === null || r.key === 'ldk')) ldk = r;
        if (r.type === 'hall') hall += r.m2;
        if (r.type === 'bath' || r.type === 'wash' || r.type === 'laundry')
            water.push(r);
    }

    let kaji = 62;
    if (water.length >= 2) {
        let cx = 0;
        let cy = 0;
        for (const r of water) {
            const rc = r.rects[0];
            if (!rc) continue;
            cx += rc.x + rc.w / 2;
            cy += rc.y + rc.h / 2;
        }
        cx /= water.length;
        cy /= water.length;
        let spread = 0;
        for (const r of water) {
            const rc = r.rects[0];
            if (!rc) continue;
            spread +=
                Math.abs(rc.x + rc.w / 2 - cx) + Math.abs(rc.y + rc.h / 2 - cy);
        }
        kaji = clamp(Math.round(100 - spread * 4.5), 58, 98);
    }
    if (has(v.waterOpts, 'ランドリールーム')) kaji = Math.min(98, kaji + 6);
    if (has(v.storageOpts, 'ファミリークローゼット'))
        kaji = Math.min(98, kaji + 5);
    if (totalM2 > 0)
        kaji = clamp(Math.round(kaji + (0.12 - hall / totalM2) * 90), 55, 98);
    if ((v.adults ?? 2) + (v.children ?? 2) >= 5 && v.toilets < 2)
        kaji = Math.max(50, kaji - 4);

    const ratio = totalM2 > 0 ? storage / totalM2 : 0;
    const syuno = clamp(Math.round((ratio / 0.18) * 100), 30, 100);

    let saiko = 58;
    if (ldk) {
        if (rectsTouchSun(ldk.rects, v.roadSide, gridW, gridD)) saiko += 22;
        if (ldk.jo >= v.ldkSize - 0.5) saiko += 9;
        saiko += clamp(Math.round(ldk.jo - v.ldkSize), -6, 8);
    }
    if (has(v.extraRooms, '吹き抜け')) saiko += 6;
    if (has(v.surroundings, '隣家が近い')) saiko = Math.max(50, saiko - 4);
    if (has(v.surroundings, '見晴らしが良い')) saiko = Math.min(98, saiko + 4);
    saiko = clamp(saiko, 50, 98);

    const budget = v.budget ?? 3800;
    const diff = (costTotal - budget) / budget;
    const yosan = clamp(
        Math.round(100 - Math.abs(diff) * 150 - (diff > 0 ? 10 : 0)),
        8,
        98,
    );

    const pr = v.priorities ?? [];
    const wK = customWeights
        ? customWeights.housework
        : has(pr, '家事動線')
          ? config.scoringWeights.houseworkPriorityMultiplier
          : 1;
    const wS = customWeights
        ? customWeights.storage
        : has(pr, '収納量')
          ? config.scoringWeights.storagePriorityMultiplier
          : 1;
    const wL = customWeights
        ? customWeights.daylight
        : has(pr, '採光・明るさ')
          ? config.scoringWeights.daylightPriorityMultiplier
          : 1;
    const wY = customWeights
        ? customWeights.budget
        : config.scoringWeights.budgetWeight;
    const total =
        (kaji * wK + syuno * wS + saiko * wL + yosan * wY) /
        (wK + wS + wL + wY);

    return {
        housework: Math.round(kaji),
        storage: Math.round(syuno),
        daylight: Math.round(saiko),
        budget: Math.round(yosan),
        total: Math.round(total),
    };
}
