import { useState, useMemo, useCallback } from 'react';
import { PlanFromAnswersPage } from '@/features/plan';
import { WizardPage, getDefaultWizardAnswers } from '@/features/wizard';
import { useSession } from '@/features/auth';
import {
    AiAnalysisScreen,
    useAiAnalysis,
    buildLocalConstraints,
    type AiAnalysisResult,
} from '@/features/ai';
import {
    useProjectSync,
    ProjectSyncStatus,
    ProjectLoadingState,
    ProjectNotFoundState,
} from '@/features/projects';
import {
    isDevResultActive,
    readDevAnswersOverride,
    isDevAnalyzingActive,
    cleanResultHash,
    type AnalysisState,
} from './wizard-flow-helpers';

export function WizardFlow(): React.JSX.Element {
    const { isAuthenticated } = useSession();
    const [pendingAnswers, setPendingAnswers] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [analysisState, setAnalysisState] = useState<AnalysisState | null>(
        null,
    );
    const [isDevResultDismissed, setIsDevResultDismissed] = useState(false);
    const defaultAnswers = useMemo(
        () => ({ ...getDefaultWizardAnswers(), ...readDevAnswersOverride() }),
        [],
    );
    const currentAnswers = analysisState?.answers ?? pendingAnswers ?? {};
    const {
        projectId,
        status: syncStatus,
        isProjectLoading,
        projectError,
        handleFinalSubmit,
    } = useProjectSync(currentAnswers);

    const handleAnalysisComplete = useCallback(
        (result: AiAnalysisResult): void => {
            if (!pendingAnswers) return;
            void handleFinalSubmit(result.plans);
            setAnalysisState({ ...result, answers: pendingAnswers });
            setPendingAnswers(null);
        },
        [pendingAnswers, handleFinalSubmit],
    );

    const { step: analysisStep } = useAiAnalysis({
        answers: pendingAnswers,
        onComplete: handleAnalysisComplete,
    });

    const shouldShowDevResult = isDevResultActive() && !isDevResultDismissed;

    const devConstraints = useMemo(() => {
        if (!shouldShowDevResult) return undefined;
        if (
            typeof window !== 'undefined' &&
            window.location.hash.includes('ai=off')
        ) {
            return undefined;
        }
        return buildLocalConstraints(defaultAnswers);
    }, [shouldShowDevResult, defaultAnswers]);

    const handleBack = (): void => {
        if (shouldShowDevResult) {
            setIsDevResultDismissed(true);
            cleanResultHash();
        }
        setAnalysisState(null);
        setPendingAnswers(null);
    };

    const handleWizardSubmit = useCallback(
        (answers: Record<string, unknown>): void => {
            setPendingAnswers(answers);
        },
        [],
    );

    if (isProjectLoading) return <ProjectLoadingState />;
    if (projectError === 'not_found') return <ProjectNotFoundState />;

    const isDevAnalyzing = isDevAnalyzingActive();
    if (isDevAnalyzing || pendingAnswers !== null) {
        return (
            <AiAnalysisScreen
                currentStep={isDevAnalyzing ? 'analyzing' : analysisStep}
            />
        );
    }

    const activeResult =
        analysisState ??
        (shouldShowDevResult
            ? {
                  answers: defaultAnswers,
                  plans: undefined,
                  constraints: devConstraints,
                  source: 'local' as const,
                  isDegraded: true,
                  review: undefined,
              }
            : null);

    if (activeResult) {
        return (
            <div className="relative min-h-screen w-full max-w-full overflow-x-hidden">
                <PlanFromAnswersPage
                    answers={activeResult.answers}
                    plans={activeResult.plans}
                    constraints={activeResult.constraints}
                    aiSource={activeResult.source}
                    isDegraded={activeResult.isDegraded}
                    review={activeResult.review}
                    projectId={projectId}
                    onBack={handleBack}
                    onEditAnswers={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="relative">
            <WizardPage
                key={
                    projectId !== null
                        ? `project-${projectId.toString()}`
                        : 'new-project'
                }
                onSubmit={handleWizardSubmit}
            />
            {isAuthenticated ? (
                <div className="fixed bottom-3 right-4 z-40 sm:bottom-4 sm:right-6 pointer-events-none">
                    <div className="pointer-events-auto shadow-md rounded-full">
                        <ProjectSyncStatus status={syncStatus} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
