import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles, Undo2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { type AiPlannerState } from '../hooks/useAiPlanner';

export function AiPlannerBar({
    state,
}: {
    readonly state: AiPlannerState;
}): React.JSX.Element {
    const { t } = useTranslation();
    const isRunning = state.status === 'running';
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[24px] border border-violet-200/80 bg-violet-50/60 px-4 py-3">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Sparkles
                    className="mt-0.5 h-4 w-4 shrink-0 text-violet-600"
                    aria-hidden="true"
                />
                <div className="min-w-0 text-xs sm:text-sm text-slate-700">
                    <p className="font-bold text-slate-900">
                        {t('plan:aiPlannerTitle')}
                    </p>
                    <p>
                        {isRunning
                            ? t('plan:aiPlannerRunning', {
                                  done: state.progress,
                              })
                            : state.status === 'done'
                              ? t('plan:aiPlannerDone', {
                                    count: state.aiCount,
                                })
                              : state.status === 'failed'
                                ? t('plan:aiPlannerFailed')
                                : t('plan:aiPlannerHint')}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {state.isShowingAi ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={state.restoreRules}
                        className="rounded-full min-h-[40px]"
                    >
                        <Undo2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        {t('plan:aiPlannerRestore')}
                    </Button>
                ) : null}
                <Button
                    type="button"
                    size="sm"
                    disabled={isRunning}
                    onClick={state.run}
                    className="rounded-full min-h-[40px] bg-violet-600 hover:bg-violet-700 text-white"
                >
                    {isRunning ? (
                        <Loader2
                            className="mr-1.5 h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <Sparkles
                            className="mr-1.5 h-4 w-4"
                            aria-hidden="true"
                        />
                    )}
                    {t('plan:aiPlannerButton')}
                </Button>
            </div>
        </div>
    );
}
