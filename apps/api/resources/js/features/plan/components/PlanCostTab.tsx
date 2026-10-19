import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Coins } from 'lucide-react';
import { type Plan } from '@aihome/planner';
import { Badge } from '@/shared/ui/Badge';
import { calculatePlanCost } from '../lib/plan-cost';
import { PlanCostDonut } from './PlanCostDonut';
import { PlanCostBreakdown } from './PlanCostBreakdown';
import { PlanCostLoanSim } from './PlanCostLoanSim';

type PlanCostTabProps = {
    readonly plan: Plan;
    readonly answers?: Record<string, unknown> | undefined;
};

export function PlanCostTab({
    plan,
    answers = {},
}: PlanCostTabProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const cost = useMemo(
        () => calculatePlanCost(plan, answers),
        [plan, answers],
    );

    const isDiffPositive = cost.budgetDiff >= 0;

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                            <Coins className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                {t('plan:costOverviewTitle')}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {t('plan:costOverviewSubtitle')}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="rounded-full text-xs font-semibold px-2.5 py-0.5 w-fit border-amber-300 bg-amber-50/80 text-amber-800"
                    >
                        {t('plan:costRoughEstimateBadge')}
                    </Badge>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                                {t('plan:costTotalLabel')}
                            </span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                                    {cost.total.toLocaleString()}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-200">
                                    {t('plan:unitManYen')}
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-5">
                            <div>
                                {t('plan:costBudgetCompare', {
                                    budget: cost.buildBudget.toLocaleString(),
                                    sign: isDiffPositive ? '+' : '-',
                                    diff: Math.abs(
                                        cost.budgetDiff,
                                    ).toLocaleString(),
                                })}
                            </div>
                            <div className="text-slate-400">
                                {t('plan:costUnitPriceNote', {
                                    rate: cost.unitPrice.toLocaleString(),
                                    tsubo: cost.tsubo.toFixed(1),
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <PlanCostDonut total={cost.total} breakdown={cost.breakdown} />
            </div>

            <PlanCostBreakdown cost={cost} />
            <PlanCostLoanSim totalMan={cost.total} />

            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs text-slate-700 flex items-start gap-3">
                <Info
                    className="h-4 w-4 text-[#0b6bdc] shrink-0 mt-0.5"
                    aria-hidden="true"
                />
                <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                        {t('plan:costDisclaimerHeading')}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        {t('plan:costDisclaimerNotice')}
                    </p>
                </div>
            </div>
        </div>
    );
}
