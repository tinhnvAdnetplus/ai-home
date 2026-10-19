import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type CostBreakdownItem } from '../lib/plan-cost';

type PlanCostDonutProps = {
    readonly total: number;
    readonly breakdown: readonly CostBreakdownItem[];
};

const COLOR_CLASSES: Record<string, string> = {
    honntai: 'bg-[#0b6bdc]',
    options: 'bg-[#10b981]',
    futai: 'bg-[#f59e0b]',
    shohi: 'bg-[#6366f1]',
};

export function PlanCostDonut({
    total,
    breakdown,
}: PlanCostDonutProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const segments = useMemo(() => {
        return breakdown.map((item, index) => {
            const accumulated =
                breakdown
                    .slice(0, index)
                    .reduce((sum, prev) => sum + prev.value, 0) / total;
            const strokeDasharray = `${((item.value / total) * circumference).toString()} ${circumference.toString()}`;
            const strokeDashoffset = (-accumulated * circumference).toString();
            return {
                item,
                strokeDasharray,
                strokeDashoffset,
            };
        });
    }, [breakdown, total, circumference]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div className="relative shrink-0 flex items-center justify-center">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size.toString()} ${size.toString()}`}
                    className="-rotate-90"
                    role="img"
                    aria-label={t('plan:costBreakdownTitle')}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth={strokeWidth}
                    />
                    {segments.map(
                        ({ item, strokeDasharray, strokeDashoffset }) => (
                            <circle
                                key={item.id}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        ),
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                        {t('plan:costTotalLabel')}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {total.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                        {t('plan:unitManYen')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto text-xs">
                {breakdown.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs"
                    >
                        <span
                            className={`h-3 w-3 rounded-full shrink-0 ${COLOR_CLASSES[item.id] ?? 'bg-slate-400'}`}
                            aria-hidden="true"
                        />
                        <div className="min-w-0">
                            <span className="text-slate-600 font-medium block truncate">
                                {t(item.nameKey, {
                                    defaultValue: item.nameDefault,
                                })}
                            </span>
                            <span className="text-slate-900 font-bold block">
                                {item.value.toLocaleString()}{' '}
                                {t('plan:unitManYen')}{' '}
                                <span className="text-[11px] font-normal text-slate-400">
                                    ({item.percent.toString()}%)
                                </span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
