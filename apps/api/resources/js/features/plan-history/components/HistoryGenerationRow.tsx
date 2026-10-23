import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { PlanMiniThumb } from '@/features/plan';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/format';
import type { PlanGeneration } from '../lib/plan-generations';

export interface HistoryGenerationRowProps {
    readonly generation: PlanGeneration;
    readonly isLatest: boolean;
    readonly selectedPlanId: number | null;
    readonly onSelectPlan: (planId: number) => void;
}

export function HistoryGenerationRow({
    generation,
    isLatest,
    selectedPlanId,
    onSelectPlan,
}: HistoryGenerationRowProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const createdAt = formatDateTime(generation.createdAt, i18n.language, {
        second: undefined,
    });

    return (
        <li className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700">
                    {t('projects:history.generation', {
                        index: generation.index,
                    })}
                    {isLatest ? (
                        <span className="ml-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0b6bdc]">
                            {t('projects:history.latest')}
                        </span>
                    ) : null}
                </span>
                <time
                    dateTime={generation.createdAt}
                    className="text-slate-400 tabular-nums"
                >
                    {createdAt}
                </time>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {generation.plans.map((plan) => {
                    const isSelected = plan.id === selectedPlanId;
                    return (
                        <button
                            key={plan.id}
                            type="button"
                            onClick={() => {
                                onSelectPlan(plan.id);
                            }}
                            aria-pressed={isSelected}
                            title={plan.label}
                            className={cn(
                                'flex min-w-0 flex-col items-center gap-1 rounded-2xl border bg-white p-1.5 transition-colors min-h-[44px]',
                                isSelected
                                    ? 'border-[#0b6bdc] ring-2 ring-[#0b6bdc]/20'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                            )}
                        >
                            {plan.model ? (
                                <PlanMiniThumb
                                    model={plan.model}
                                    className="h-14 w-full"
                                />
                            ) : (
                                <div className="flex h-14 w-full items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                                    <AlertTriangle
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </div>
                            )}
                            <span className="w-full truncate text-[11px] font-semibold text-slate-700">
                                {plan.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </li>
    );
}
