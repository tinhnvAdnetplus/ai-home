import { type PlanInput, type Plan } from './types.js';
import { type DesignConstraints } from './constraints.js';
import { applyDesignConstraints } from './constraints-apply.js';
import { generatePlans } from './generate.js';
import { lotOverflow } from './lot-fit.js';
import { defaultPlannerConfig } from './config.js';

const TSUBO_M2 = 3.305785;

export type FeasibilityIssue = {
    readonly code: string;
    /** blocking: no program change can help (the lot itself); conflict: the request must change */
    readonly severity: 'blocking' | 'conflict';
    /** Japanese, for the AI and for the customer */
    readonly message: string;
};

export type FeasibilityReport = {
    readonly isFeasible: boolean;
    readonly isBlocked: boolean;
    /** how far the request is from fitting: metres of overflow plus scaled area excess; 0 when it fits */
    readonly excess: number;
    readonly lot: {
        readonly frontageM: number;
        readonly depthM: number;
        readonly areaEnteredM2: number;
        readonly areaFromDimensionsM2: number;
        readonly coveragePercent: number;
        readonly floorRatioPercent: number;
        /** largest floor plate the coverage limit allows */
        readonly maxFootprintM2: number;
        /** largest total floor area the floor-area ratio allows */
        readonly maxTotalM2: number;
        /** cars that fit side by side across the frontage (2.5 m stalls) */
        readonly carsAcross: number;
    };
    readonly outcome: {
        /** what the planner drew for the first proposal */
        readonly totalTsubo: number;
        readonly footprintM2: number;
        readonly overflowWidthM: number;
        readonly overflowDepthM: number;
    };
    readonly issues: readonly FeasibilityIssue[];
};

/** The program the planner actually works from: answers, then AI constraints, then review overrides. */
export function effectiveProgram(
    input: PlanInput,
    constraints?: DesignConstraints,
    overrides?: Partial<PlanInput>,
): PlanInput {
    const withC = constraints
        ? applyDesignConstraints(input, constraints).input
        : input;
    return overrides ? { ...withC, ...overrides } : withC;
}

function footprintM2(plan: Plan): number {
    const walls = plan.model.floors[0]?.walls ?? [];
    if (walls.length === 0) return 0;
    const xs = walls.flatMap((w) => [w.a.x, w.b.x]);
    const ys = walls.flatMap((w) => [w.a.y, w.b.y]);
    return (
        ((Math.max(...xs) - Math.min(...xs)) *
            (Math.max(...ys) - Math.min(...ys))) /
        1e6
    );
}

const r1 = (n: number): number => Math.round(n * 10) / 10;

/**
 * Checks a request against the lot by running the planner and measuring what it drew, so the
 * numbers handed to the AI are facts, never estimates the AI has to compute.
 */
export function assessFeasibility(
    input: PlanInput,
    constraints?: DesignConstraints,
    overrides?: Partial<PlanInput>,
): FeasibilityReport {
    const prog = effectiveProgram(input, constraints, overrides);
    const cov = prog.coverageLimit ?? defaultPlannerConfig.defaultCoverageLimit;
    const far =
        prog.floorRatioLimit ?? defaultPlannerConfig.defaultFloorRatioLimit;
    const areaEntered = prog.landAreaTsubo * TSUBO_M2;
    const areaDims = prog.frontage * prog.landDepth;
    const carsAcross = Math.floor((prog.frontage + 0.2) / 2.5);

    const issues: FeasibilityIssue[] = [];
    // tightest setbacks the planner ever uses: 0.5 m to the road, 0.6 m at the back, 0.5 m at each side
    if (prog.landDepth - 1.1 < 4.6 || prog.frontage - 1.0 < 4.6) {
        issues.push({
            code: 'LOT_TOO_SMALL',
            severity: 'blocking',
            message: `敷地 間口${prog.frontage.toString()}m×奥行${prog.landDepth.toString()}m では、外壁後退を除くと建物の幅・奥行が4.6m未満になり住宅を計画できません。敷地寸法の入力をご確認ください。`,
        });
    }

    const result = generatePlans(input, constraints, undefined, 42, overrides);
    const plan = result.plans[0];
    const over = lotOverflow(plan.model);
    const tsubo = plan.summary.tsubo;
    const fp = footprintM2(plan);

    if (prog.cars > carsAcross && prog.parkingType !== 'ビルトイン') {
        issues.push({
            code: 'PARKING_TOO_NARROW',
            severity: 'conflict',
            message: `間口${prog.frontage.toString()}mに並列で置ける駐車は${carsAcross.toString()}台までです（希望${prog.cars.toString()}台、1台あたり幅2.5m）。`,
        });
    }
    if (over) {
        issues.push({
            code: 'HOUSE_EXCEEDS_LOT',
            severity: 'conflict',
            message: `要望どおりの建物（延床約${r1(tsubo).toString()}坪）は敷地からはみ出します（${[
                over.widthM > 0 ? `間口方向${over.widthM.toString()}m` : '',
                over.depthM > 0 ? `奥行方向${over.depthM.toString()}m` : '',
            ]
                .filter((x) => x !== '')
                .join('、')}）。`,
        });
    }
    if (fp > (areaDims * cov) / 100 + 0.5) {
        issues.push({
            code: 'COVERAGE_EXCEEDED',
            severity: 'conflict',
            message: `建築面積約${r1(fp).toString()}㎡が建ぺい率${cov.toString()}%の上限（${r1((areaDims * cov) / 100).toString()}㎡）を超えます。`,
        });
    }
    if (tsubo * TSUBO_M2 > (areaDims * far) / 100 + 0.5) {
        issues.push({
            code: 'FLOOR_RATIO_EXCEEDED',
            severity: 'conflict',
            message: `延床約${r1(tsubo * TSUBO_M2).toString()}㎡が容積率${far.toString()}%の上限（${r1((areaDims * far) / 100).toString()}㎡）を超えます。`,
        });
    }

    const parkingExcess =
        prog.parkingType !== 'ビルトイン'
            ? Math.max(0, prog.cars - carsAcross) * 2.5
            : 0;
    const excess =
        (over ? over.widthM + over.depthM : 0) +
        parkingExcess +
        Math.max(0, fp - (areaDims * cov) / 100) / 10 +
        Math.max(0, tsubo * TSUBO_M2 - (areaDims * far) / 100) / 10;

    return {
        isFeasible: issues.length === 0,
        excess: Math.round(excess * 100) / 100,
        isBlocked: issues.some((i) => i.severity === 'blocking'),
        lot: {
            frontageM: prog.frontage,
            depthM: prog.landDepth,
            areaEnteredM2: r1(areaEntered),
            areaFromDimensionsM2: r1(areaDims),
            coveragePercent: cov,
            floorRatioPercent: far,
            maxFootprintM2: r1((areaDims * cov) / 100),
            maxTotalM2: r1((areaDims * far) / 100),
            carsAcross,
        },
        outcome: {
            totalTsubo: r1(tsubo),
            footprintM2: r1(fp),
            overflowWidthM: over?.widthM ?? 0,
            overflowDepthM: over?.depthM ?? 0,
        },
        issues,
    };
}
