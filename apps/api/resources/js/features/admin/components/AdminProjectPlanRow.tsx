import { useTranslation } from 'react-i18next';
import type { AdminProjectItem } from '../types/admin-types';

type Props = { readonly plan: AdminProjectItem['plans'][number] };

export function AdminProjectPlanRow({ plan }: Props): React.JSX.Element {
    const { t } = useTranslation('admin');
    return (
        <div
            key={plan.id}
            className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {plan.label}
                </div>
                <div>
                    <div className="font-bold text-slate-900">
                        {t('areaFormat', {
                            tsubo: plan.tsubo,
                            floorAreaM2: plan.floorAreaM2,
                        })}
                    </div>
                    <div className="text-[11px] text-slate-500">
                        {t('planIdLabel', {
                            id: plan.id,
                        })}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {t('planScoreLabel', {
                        score: plan.scoreTotal,
                    })}
                </span>
                <span className="text-slate-600">
                    {t('planHouseworkLabel', {
                        score: plan.scoreHousework,
                    })}
                </span>
                <span className="text-slate-600">
                    {t('planStorageLabel', {
                        score: plan.scoreStorage,
                    })}
                </span>
                <span className="text-slate-600">
                    {t('planDaylightLabel', {
                        score: plan.scoreDaylight,
                    })}
                </span>
                <span className="text-slate-600">
                    {t('planBudgetLabel', {
                        score: plan.scoreBudget,
                    })}
                </span>
            </div>
        </div>
    );
}
