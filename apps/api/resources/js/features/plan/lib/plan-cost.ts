import { type Plan } from '@aihome/planner';
import {
    UNIT_PRICE_RATES,
    DEFAULT_UNIT_PRICE,
    STRUCTURE_MULTIPLIERS,
    ROOF_MULTIPLIERS,
    ANCILLARY_WORK_RATIO,
    MISC_EXPENSES_RATIO,
} from './plan-cost-rates';
import { type PlanCostResult } from './plan-cost-types';
import { calculatePlanOptions } from './plan-cost-options';
import { buildCostBreakdown } from './plan-cost-breakdown';

export type {
    CostBreakdownItem,
    PlanCostOption,
    PlanCostResult,
    LoanSimulationResult,
} from './plan-cost-types';
export { calculateLoanPayment } from './plan-loan';

function safeString(v: unknown, fallback: string): string {
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
}

export function calculatePlanCost(
    plan: Plan,
    answers: Record<string, unknown> = {},
): PlanCostResult {
    const tsubo = Math.max(15, plan.summary.tsubo);
    const grade = safeString(answers.grade, 'スタンダード');
    const structure = safeString(answers.structure, '木造軸組');
    const roofType = safeString(
        answers.roofType ?? plan.model.roof.kind,
        '切妻',
    );

    let base =
        (UNIT_PRICE_RATES[grade] ?? DEFAULT_UNIT_PRICE) *
        (STRUCTURE_MULTIPLIERS[structure] ?? 1.0) *
        (ROOF_MULTIPLIERS[roofType] ?? 1.0);

    if (tsubo < 28) base *= 1.07;
    else if (tsubo > 48) base *= 0.97;
    if (plan.model.floors.length === 1) base *= 1.06;

    const honntai = Math.round(tsubo * base);
    const opts = calculatePlanOptions(plan, answers);
    const optTotal = opts.reduce((acc, o) => acc + o.cost, 0);
    const futai = Math.round(honntai * ANCILLARY_WORK_RATIO);
    const shohi = Math.round(honntai * MISC_EXPENSES_RATIO);
    const total = honntai + optTotal + futai + shohi;

    const rawBudget =
        typeof answers.budget === 'number' ? answers.budget : 3500;
    const landPrice =
        answers.budgetScope === '土地込み' &&
        typeof answers.landPrice === 'number'
            ? answers.landPrice
            : 0;
    const buildBudget = Math.max(1000, rawBudget - landPrice);

    const breakdown = buildCostBreakdown({
        honntai,
        optTotal,
        futai,
        shohi,
        total,
        basePrice: base,
        tsubo,
        optionCount: opts.length,
    });

    return {
        tsubo,
        unitPrice: Math.round(base),
        honntai,
        options: opts,
        optTotal,
        futai,
        shohi,
        total,
        breakdown,
        buildBudget,
        budgetDiff: total - buildBudget,
    };
}
