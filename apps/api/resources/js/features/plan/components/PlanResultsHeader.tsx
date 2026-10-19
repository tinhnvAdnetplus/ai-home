import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { type Plan } from '@aihome/planner';
import { TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Badge } from '@/shared/ui/Badge';
import { buildLocalCommentary, type AiCommentaryResponse } from '@/features/ai';
import { PlanMiniThumb } from './PlanMiniThumb';
import { calculatePlanCost } from '../lib/plan-cost';

type PlanResultsHeaderProps = {
    readonly plans: readonly Plan[];
    readonly activePlan: Plan;
    readonly recommendedId: string;
    readonly answers?: Record<string, unknown> | undefined;
    readonly commentary?: AiCommentaryResponse | null | undefined;
};

export function PlanResultsHeader({
    plans,
    activePlan,
    recommendedId,
    answers = {},
    commentary,
}: PlanResultsHeaderProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);

    return (
        <div className="space-y-4 sm:space-y-5 w-full min-w-0">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full h-auto p-0 bg-transparent border-0 min-w-0">
                {plans.map((p, idx) => {
                    const isBest = p.id === recommendedId;
                    const planLabel =
                        idx === 0
                            ? t('plan:planA')
                            : idx === 1
                              ? t('plan:planB')
                              : t('plan:planC');
                    const cost = calculatePlanCost(p, answers);
                    const commentaryItem =
                        commentary?.items.find(
                            (item) =>
                                item.label === p.label ||
                                p.label.includes(item.label),
                        ) ?? buildLocalCommentary(plans).items[idx];
                    const planDesc =
                        commentaryItem?.body ?? commentaryItem?.headline ?? '';

                    return (
                        <TabsTrigger
                            key={p.id}
                            value={p.id}
                            id={`plan-tab-${p.id}`}
                            className="min-w-0 w-full rounded-[24px] border p-3.5 sm:p-4 text-left flex flex-col gap-2.5 transition-all cursor-pointer bg-white border-slate-200/90 shadow-2xs data-[state=active]:border-[#0b6bdc] data-[state=active]:ring-2 data-[state=active]:ring-[#0b6bdc]/20 data-[state=active]:shadow-sm data-[state=inactive]:hover:border-slate-300 min-h-[96px]"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                                        {planLabel}
                                    </span>
                                    {p.source === 'ai' ? (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full text-[10px] font-bold px-2 py-0.5 shrink-0 bg-violet-600 text-white"
                                        >
                                            {t('plan:aiPlannerBadge')}
                                        </Badge>
                                    ) : null}
                                    {isBest ? (
                                        <Badge
                                            variant="success"
                                            className="rounded-full text-[10px] font-bold px-2 py-0.5 shrink-0 bg-emerald-600 text-white flex items-center gap-0.5"
                                        >
                                            <Sparkles
                                                className="h-2.5 w-2.5 fill-current"
                                                aria-hidden="true"
                                            />
                                            <span>{t('plan:recommended')}</span>
                                        </Badge>
                                    ) : null}
                                </div>
                                <span className="text-xs font-black text-[#0b6bdc] bg-blue-50/80 px-2 py-0.5 rounded-full shrink-0">
                                    {p.score.total.toString()}{' '}
                                    {t('plan:points')}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 w-full">
                                <PlanMiniThumb
                                    model={p.model}
                                    className="h-16 w-16 sm:h-20 sm:w-20 shrink-0"
                                />
                                <div className="text-xs space-y-0.5 min-w-0 flex-1">
                                    <div className="text-slate-600 truncate">
                                        <span className="text-slate-400 font-normal">
                                            {t('plan:floorArea')}:{' '}
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {p.summary.tsubo.toFixed(1)}
                                        </span>{' '}
                                        {t('plan:tsubo')}
                                    </div>
                                    <div className="text-slate-600 truncate">
                                        <span className="text-slate-400 font-normal">
                                            {t('plan:costRoughEstimateLabel')}
                                            :{' '}
                                        </span>
                                        <span className="font-extrabold text-slate-900">
                                            {cost.total.toLocaleString()}
                                        </span>{' '}
                                        {t('plan:unitManYen')}
                                    </div>
                                </div>
                            </div>

                            {planDesc !== '' ? (
                                <p className="block w-full whitespace-normal text-left break-words text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {planDesc}
                                </p>
                            ) : null}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-white p-3.5 sm:p-4 rounded-[20px] border border-slate-200/80 shadow-2xs w-full min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {activePlan.label}
                    </span>
                    {activePlan.id === recommendedId ? (
                        <Badge
                            variant="success"
                            className="rounded-full text-xs font-semibold px-2 py-0.5 shrink-0"
                        >
                            {t('plan:recommended')}
                        </Badge>
                    ) : null}
                </div>
                <div className="text-xs text-slate-500 shrink-0">
                    <span className="font-semibold text-slate-700">
                        {t('plan:scoreTotal')}:
                    </span>{' '}
                    <span className="text-base sm:text-lg font-black text-[#0b6bdc]">
                        {activePlan.score.total.toString()}
                    </span>{' '}
                    {t('plan:points')}
                </div>
            </div>
        </div>
    );
}
