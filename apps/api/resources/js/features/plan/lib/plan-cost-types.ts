export type CostBreakdownKey =
    | 'plan:costHonntai'
    | 'plan:costOptions'
    | 'plan:costFutai'
    | 'plan:costShohi';

export interface CostBreakdownItem {
    readonly id: string;
    readonly nameKey: CostBreakdownKey;
    readonly nameDefault: string;
    readonly value: number;
    readonly percent: number;
    readonly note: string;
    readonly color: string;
}

export interface PlanCostOption {
    readonly label: string;
    readonly cost: number;
}

export interface PlanCostResult {
    readonly tsubo: number;
    readonly unitPrice: number;
    readonly honntai: number;
    readonly options: readonly PlanCostOption[];
    readonly optTotal: number;
    readonly futai: number;
    readonly shohi: number;
    readonly total: number;
    readonly breakdown: readonly CostBreakdownItem[];
    readonly buildBudget: number;
    readonly budgetDiff: number;
}

export interface LoanSimulationResult {
    readonly monthlyPayment: number;
    readonly principal: number;
    readonly totalPayment: number;
    readonly interest: number;
}
