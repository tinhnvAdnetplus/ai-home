import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, CheckSquare } from 'lucide-react';
import { type Plan } from '@aihome/planner';
import { buildPlanComparison } from '../lib/plan-comparison';

type PlanComparisonCardProps = {
    readonly answers: Record<string, unknown>;
    readonly plan: Plan;
};

export function PlanComparisonCard({
    answers,
    plan,
}: PlanComparisonCardProps): React.JSX.Element {
    const { t } = useTranslation();
    const rows = buildPlanComparison(answers, plan);

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b6bdc]">
                    <CheckSquare className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t('plan:comparisonTitle')}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                        {t('plan:comparisonSubtitle')}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[280px]">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[11px]">
                            <th className="pb-2 font-semibold w-1/3">
                                {t('plan:comparisonItemCol')}
                            </th>
                            <th className="pb-2 font-semibold w-1/5">
                                {t('plan:comparisonWishCol')}
                            </th>
                            <th className="pb-2 font-semibold w-1/5">
                                {t('plan:comparisonResultCol')}
                            </th>
                            <th className="pb-2 font-semibold text-right w-1/4">
                                {t('plan:comparisonMatchCol')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                className={
                                    row.isMatch
                                        ? 'text-slate-700'
                                        : 'bg-amber-50/60 text-amber-900'
                                }
                            >
                                <td className="py-2.5 font-medium text-slate-800">
                                    {t(row.labelKey)}
                                </td>
                                <td className="py-2.5 text-slate-500 font-medium">
                                    {row.wishValue}
                                </td>
                                <td className="py-2.5 font-bold">
                                    {row.resultValue}
                                </td>
                                <td className="py-2.5 text-right">
                                    {row.isMatch ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                            <CheckCircle2
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            <span>
                                                {t('plan:comparisonMatch')}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-1.5 py-0.5 whitespace-nowrap">
                                            <AlertTriangle
                                                className="h-3 w-3 text-amber-600 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span>
                                                {row.diffText
                                                    ? t(
                                                          'plan:comparisonNeedsReviewWithDiff',
                                                          {
                                                              diff: row.diffText,
                                                          },
                                                      )
                                                    : t(
                                                          'plan:comparisonNeedsReview',
                                                      )}
                                            </span>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
