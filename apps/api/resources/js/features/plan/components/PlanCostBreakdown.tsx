import { useTranslation } from 'react-i18next';
import { type PlanCostResult } from '../lib/plan-cost';

type PlanCostBreakdownProps = {
    readonly cost: PlanCostResult;
};

export function PlanCostBreakdown({
    cost,
}: PlanCostBreakdownProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const maxValue = Math.max(...cost.breakdown.map((b) => b.value), 1);

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('plan:costBreakdownTitle')}
                </h3>
                <div className="space-y-3">
                    {cost.breakdown.map((item) => {
                        const widthPercent = Math.min(
                            100,
                            Math.max(
                                8,
                                Math.round((item.value / maxValue) * 100),
                            ),
                        );
                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-2xs space-y-2"
                            >
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <div>
                                        <span className="font-bold text-slate-800">
                                            {t(item.nameKey, {
                                                defaultValue: item.nameDefault,
                                            })}
                                        </span>
                                        <p className="text-[11px] text-slate-500 font-normal">
                                            {item.note}
                                        </p>
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-slate-900 shrink-0">
                                        {item.value.toLocaleString()}{' '}
                                        <span className="text-xs font-semibold text-slate-600">
                                            {t('plan:unitManYen')}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <svg
                                        className="h-full w-full"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x={0}
                                            y={0}
                                            width={`${widthPercent.toString()}%`}
                                            height="100%"
                                            rx={5}
                                            fill={item.color}
                                        />
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('plan:costOptionsTitle')}
                </h3>
                {cost.options.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="py-2.5 px-3 font-semibold">
                                        {t('plan:costOptionName')}
                                    </th>
                                    <th className="py-2.5 px-3 font-semibold text-right w-28">
                                        {t('plan:costOptionPrice')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cost.options.map((opt, i) => (
                                    <tr
                                        key={`${opt.label}-${i.toString()}`}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <td className="py-2 px-3 text-slate-800 font-medium">
                                            {opt.label}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                            {opt.cost.toLocaleString()}{' '}
                                            {t('plan:unitManYen')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 py-2">
                        {t('plan:noOptionsSelected')}
                    </p>
                )}
            </div>
        </div>
    );
}
