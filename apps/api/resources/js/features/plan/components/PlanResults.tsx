import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@/shared/ui/Tabs';
import { AiReviewCard, AiUnderstandingCard } from '@/features/ai';
import { FloorPlanViewHandle } from './FloorPlanView';
import { PlanViewSwitcher } from './PlanViewSwitcher';
import { AiPlannerBar } from './AiPlannerBar';
import { PlanResultsHeader } from './PlanResultsHeader';
import { PlanResultsSidebar } from './PlanResultsSidebar';
import { DownloadBar } from './DownloadBar';
import { PlanErrorState } from './PlanErrorState';
import { PlanRefineBlock } from './PlanRefineBlock';
import { PlanDisclaimerFlow } from './PlanDisclaimerFlow';
import { PlanCtaBand } from './PlanCtaBand';
import { LotFitBanner } from './LotFitBanner';
import { usePlanResults, type PlanResultsProps } from '../hooks/usePlanResults';

export function PlanResults({
    plans: initialPlans,
    answers: initialAnswers,
    constraints,
    aiSource,
    isDegraded,
    review,
    projectId,
    onBack,
    onEditAnswers,
}: PlanResultsProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const viewerRef = useRef<FloorPlanViewHandle>(null);

    const {
        currentPlans,
        currentAnswers,
        activePlan,
        recommendedId,
        commentary,
        activeCommentary,
        materials,
        viewMode,
        isRegenerating,
        isLoading,
        isError,
        retry,
        setViewMode,
        setUserSelectedId,
        handleRefine,
        aiPlanner,
    } = usePlanResults({
        initialPlans,
        initialAnswers,
        constraints,
        aiSource,
        isDegraded,
        review,
    });

    if (!activePlan) {
        return (
            <PlanErrorState
                onBack={onEditAnswers ?? onBack}
                title={t('plan:emptyTitle')}
                message={t('plan:emptyDescription')}
            />
        );
    }

    const isDownloadVisible =
        viewMode === '2d' || viewMode === '3d' || viewMode === 'elevations';

    return (
        <div className="space-y-6 sm:space-y-8 w-full min-w-0">
            <AiUnderstandingCard
                constraints={constraints}
                source={aiSource ?? 'local'}
                isDegraded={isDegraded ?? false}
            />

            <AiReviewCard review={review} />

            <AiPlannerBar state={aiPlanner} />

            <Tabs
                value={activePlan.id}
                onValueChange={setUserSelectedId}
                className="w-full min-w-0 space-y-4 sm:space-y-6"
            >
                <PlanResultsHeader
                    plans={currentPlans}
                    activePlan={activePlan}
                    recommendedId={recommendedId}
                    answers={currentAnswers}
                    commentary={commentary}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
                    <div className="lg:col-span-8 space-y-4 w-full min-w-0">
                        <LotFitBanner model={activePlan.model} />
                        <PlanViewSwitcher
                            key={activePlan.id}
                            ref={viewerRef}
                            mode={viewMode}
                            onModeChange={setViewMode}
                            model={activePlan.model}
                            plan={activePlan}
                            answers={currentAnswers}
                            materials={materials}
                            planLabel={activePlan.label}
                            onEditAnswers={onEditAnswers}
                        />
                        {isDownloadVisible ? (
                            <DownloadBar
                                plan={activePlan}
                                currentView={viewMode}
                                projectId={projectId ?? null}
                                answers={currentAnswers}
                                materials={materials}
                                commentary={activeCommentary}
                                getSvgElement={() =>
                                    viewerRef.current?.getSvgElement() ?? null
                                }
                            />
                        ) : null}
                    </div>
                    <div className="lg:col-span-4 w-full min-w-0">
                        <PlanResultsSidebar
                            commentary={activeCommentary}
                            isCommentaryLoading={isLoading}
                            isCommentaryError={isError}
                            onRetryCommentary={retry}
                            answers={currentAnswers}
                            plan={activePlan}
                        />
                    </div>
                </div>
            </Tabs>

            <PlanRefineBlock
                answers={currentAnswers}
                isRegenerating={isRegenerating}
                onRefine={handleRefine}
            />
            <PlanDisclaimerFlow />
            <PlanCtaBand
                onEditAnswers={onEditAnswers}
                onModeChange={setViewMode}
            />
        </div>
    );
}
