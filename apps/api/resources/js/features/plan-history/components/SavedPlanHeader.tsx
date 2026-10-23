import { useTranslation } from 'react-i18next';
import { totalFloorAreaM2 } from '@aihome/bdm';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import type { ResolvedSelection } from '../lib/history-selection';

export interface SavedPlanHeaderProps {
    readonly selection: ResolvedSelection;
}

export function SavedPlanHeader({
    selection,
}: SavedPlanHeaderProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const { history, generation, plan } = selection;

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 truncate">
                {t('projects:history.planContext', {
                    project:
                        history.project.title || t('projects:untitledProject'),
                    generation: t('projects:history.generation', {
                        index: generation.index,
                    }),
                })}
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900">
                {plan.label}
            </h2>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                <div className="flex gap-1.5">
                    <dt className="text-slate-400">
                        {t('projects:history.createdAt')}
                    </dt>
                    <dd className="tabular-nums">
                        {formatDateTime(plan.createdAt, i18n.language, {
                            second: undefined,
                        })}
                    </dd>
                </div>
                {plan.model ? (
                    <div className="flex gap-1.5">
                        <dt className="text-slate-400">
                            {t('projects:history.floorArea')}
                        </dt>
                        <dd className="tabular-nums">
                            {t('plan:areaM2', {
                                area: formatNumber(
                                    totalFloorAreaM2(plan.model),
                                    i18n.language,
                                    { maximumFractionDigits: 1 },
                                ),
                            })}
                        </dd>
                    </div>
                ) : null}
                {plan.totalScore !== null ? (
                    <div className="flex gap-1.5">
                        <dt className="text-slate-400">
                            {t('projects:history.score')}
                        </dt>
                        <dd className="font-bold text-[#0b6bdc] tabular-nums">
                            {plan.totalScore}
                        </dd>
                    </div>
                ) : null}
            </dl>
        </div>
    );
}
