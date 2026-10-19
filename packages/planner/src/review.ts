import { type PlanInput } from './types.js';
import { type DesignConstraints } from './constraints.js';
import {
    applyAdjustments,
    type AppliedAdjustment,
    type BriefAdjustment,
} from './brief.js';
import { REVIEW_STEPS, type ReviewOptions } from './review-steps.js';
import {
    assessFeasibility,
    effectiveProgram,
    type FeasibilityReport,
} from './feasibility.js';

const TSUBO_M2 = 3.305785;

/**
 * The entered land area must agree with the dimensions. A rectangle cannot be larger or smaller
 * than frontage × depth, and no lot is larger than its bounding rectangle, so in those cases the
 * dimensions (which are what gets drawn) win and the customer is told.
 */
export function inputCorrections(p: PlanInput): BriefAdjustment[] {
    const dimsTsubo = (p.frontage * p.landDepth) / TSUBO_M2;
    const ratio = p.landAreaTsubo / dimsTsubo;
    const isRect = p.landShape !== '変形';
    if (ratio <= 1.15 && (!isRect || ratio >= 0.85)) return [];
    const fixed = Math.max(10, Math.round(dimsTsubo * 10) / 10);
    return [
        {
            action: 'set',
            field: 'landAreaTsubo',
            value: fixed.toString(),
            wish: `土地面積 ${p.landAreaTsubo.toString()}坪`,
            reason: `入力された土地面積（${p.landAreaTsubo.toString()}坪＝約${Math.round(p.landAreaTsubo * TSUBO_M2).toString()}㎡）が、間口${p.frontage.toString()}m×奥行${p.landDepth.toString()}m（約${Math.round(p.frontage * p.landDepth).toString()}㎡＝${fixed.toString()}坪）と合いません。図面は寸法どおりの${fixed.toString()}坪で計算しました。面積を㎡で入力された可能性があります。`,
            source: 'input',
        },
    ];
}

/**
 * Rule-based review: applies the first applicable step, re-checks, and repeats until the
 * program fits or no step applies. Used when the AI is unavailable and to finish what the
 * AI's changes left unsolved.
 */
export function ruleAdjust(
    input: PlanInput,
    constraints: DesignConstraints | undefined,
    overrides: Partial<PlanInput>,
    options: ReviewOptions = {},
    maxSteps = 14,
): {
    readonly overrides: Partial<PlanInput>;
    readonly applied: readonly AppliedAdjustment[];
    readonly report: FeasibilityReport;
} {
    let ov = { ...overrides };
    const applied: AppliedAdjustment[] = [];
    let report = assessFeasibility(input, constraints, ov);
    // greedy: take the first change (in the customer-friendly order) that measurably shrinks
    // the excess; a change that does not help is never applied, so no wish is given up for nothing
    for (
        let i = 0;
        i < maxSteps && !report.isFeasible && !report.isBlocked;
        i++
    ) {
        const prog = effectiveProgram(input, constraints, ov);
        let isTaken = false;
        for (const step of REVIEW_STEPS) {
            const next: BriefAdjustment | null = step(
                prog,
                report,
                constraints,
                options,
            );
            if (!next) continue;
            const res = applyAdjustments(prog, [next]);
            if (res.applied.length === 0) continue;
            const tryOv = { ...ov, ...res.overrides };
            const tryReport = assessFeasibility(input, constraints, tryOv);
            if (tryReport.excess < report.excess - 0.05) {
                ov = tryOv;
                applied.push(...res.applied);
                report = tryReport;
                isTaken = true;
                break;
            }
        }
        if (!isTaken) break;
    }
    // changes that still leave the house off the lot are dropped: the customer keeps their wishes
    // and is told plainly that the lot cannot take them
    if (!report.isFeasible) {
        return {
            overrides,
            applied: [],
            report: assessFeasibility(input, constraints, overrides),
        };
    }
    return { overrides: ov, applied, report };
}

export type WhatIf = {
    readonly action: BriefAdjustment['action'];
    readonly field: string;
    readonly value: string;
    readonly from: string;
    /** excess (metres of overflow plus scaled area excess) with only this change */
    readonly excessAfter: number;
    readonly isFitAlone: boolean;
};

/**
 * Tries every single change the rules would consider, one at a time, and measures it.
 * The AI chooses among these measured options, so it never has to guess which change
 * actually makes the house smaller in this planner.
 */
export function measureWhatIfs(
    input: PlanInput,
    constraints: DesignConstraints | undefined,
    overrides: Partial<PlanInput>,
    report: FeasibilityReport,
    options: ReviewOptions = {},
): WhatIf[] {
    if (report.isFeasible || report.isBlocked) return [];
    const prog = effectiveProgram(input, constraints, overrides);
    const out: WhatIf[] = [];
    for (const step of REVIEW_STEPS) {
        const cand = step(prog, report, constraints, options);
        if (!cand) continue;
        const res = applyAdjustments(prog, [cand]);
        const first = res.applied[0];
        if (!first) continue;
        const r = assessFeasibility(input, constraints, {
            ...overrides,
            ...res.overrides,
        });
        out.push({
            action: cand.action,
            field: cand.field,
            value: cand.value,
            from: first.from,
            excessAfter: r.excess,
            isFitAlone: r.isFeasible,
        });
    }
    return out;
}

export type LocalReview = {
    readonly overrides: Partial<PlanInput>;
    readonly applied: readonly AppliedAdjustment[];
    readonly report: FeasibilityReport;
};

/** Review without the AI: correct contradictory input, then the measured rule ladder. */
export function localReview(
    input: PlanInput,
    constraints?: DesignConstraints,
    options: ReviewOptions = {},
): LocalReview {
    const corr = applyAdjustments(
        effectiveProgram(input, constraints),
        inputCorrections(effectiveProgram(input, constraints)),
    );
    const res = ruleAdjust(input, constraints, corr.overrides, options);
    return {
        overrides: res.overrides,
        applied: [...corr.applied, ...res.applied],
        report: res.report,
    };
}
