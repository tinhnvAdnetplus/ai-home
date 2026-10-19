import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Edit3 } from 'lucide-react';
import {
    generateReviewedPlans,
    mapAnswersToPlanInput,
    type Plan,
    type DesignConstraints,
} from '@aihome/planner';
import { Button } from '@/shared/ui/Button';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { type AiSource, type ProgramReview } from '@/features/ai';
import { PlanResults } from './PlanResults';
import { PlanErrorState } from './PlanErrorState';

type PlanFromAnswersPageProps = {
    readonly answers: Record<string, unknown>;
    readonly plans?: readonly Plan[] | undefined;
    readonly constraints?: DesignConstraints | undefined;
    readonly aiSource?: AiSource | undefined;
    readonly isDegraded?: boolean | undefined;
    readonly review?: ProgramReview | undefined;
    readonly projectId?: number | null | undefined;
    readonly onBack: () => void;
    readonly onEditAnswers?: (() => void) | undefined;
};

export function PlanFromAnswersPage({
    answers,
    plans: initialPlans,
    constraints,
    aiSource,
    isDegraded,
    review,
    projectId,
    onBack,
    onEditAnswers,
}: PlanFromAnswersPageProps): React.JSX.Element {
    const { t } = useTranslation();

    const result = useMemo(() => {
        if (initialPlans && initialPlans.length > 0) {
            return {
                ok: true as const,
                data: { plans: initialPlans },
                issues: [],
            };
        }
        const mapped = mapAnswersToPlanInput(answers);
        return generateReviewedPlans(
            mapped.input,
            constraints,
            review?.overrides,
        );
    }, [answers, initialPlans, constraints, review]);

    return (
        <div className="min-h-screen bg-[#f0f4f9] pb-16 text-slate-900 w-full overflow-x-hidden">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xs w-full">
                <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 w-full min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onBack}
                            className="h-11 min-h-[44px] min-w-[44px] sm:h-9 sm:min-h-0 sm:min-w-0 px-2 sm:px-3 text-xs shrink-0 rounded-xl flex items-center justify-center"
                            aria-label={t('plan:backToWizard')}
                            title={t('plan:backToWizard')}
                        >
                            <ArrowLeft
                                className="h-4 w-4 sm:mr-1 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="hidden sm:inline">
                                {t('plan:backToWizard')}
                            </span>
                        </Button>

                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                                <Sparkles
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <h1 className="text-xs sm:text-base font-bold text-slate-900 truncate max-w-[130px] sm:max-w-none">
                                {t('plan:resultsPageTitle')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onEditAnswers ?? onBack}
                            className="h-11 min-h-[44px] min-w-[44px] sm:h-9 sm:min-h-0 sm:min-w-0 px-2 sm:px-3 text-xs shrink-0 rounded-xl flex items-center justify-center"
                            aria-label={t('plan:editAnswers')}
                            title={t('plan:editAnswers')}
                        >
                            <Edit3
                                className="h-3.5 w-3.5 sm:mr-1 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="hidden sm:inline">
                                {t('plan:editAnswers')}
                            </span>
                        </Button>
                        <div className="scale-90 sm:scale-100 origin-right shrink-0">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6 w-full min-w-0">
                {review?.isBlocked ? (
                    <PlanErrorState
                        title={t('ai:blockedTitle')}
                        message={t('ai:blockedMessage')}
                        issues={[
                            ...review.adjustments
                                .filter((a) => a.source === 'input')
                                .map((a) => ({ message: a.reason })),
                            ...review.issues.map((i) => ({
                                code: i.code,
                                message: i.message,
                            })),
                            ...review.questions.map((q) => ({ message: q })),
                        ]}
                        onBack={onEditAnswers ?? onBack}
                    />
                ) : result.ok ? (
                    <PlanResults
                        plans={result.data.plans}
                        answers={answers}
                        constraints={constraints}
                        aiSource={aiSource}
                        isDegraded={isDegraded}
                        review={review}
                        projectId={projectId}
                        onBack={onBack}
                        onEditAnswers={onEditAnswers ?? onBack}
                    />
                ) : (
                    <PlanErrorState
                        issues={result.issues}
                        onBack={onEditAnswers ?? onBack}
                    />
                )}
            </main>
        </div>
    );
}
