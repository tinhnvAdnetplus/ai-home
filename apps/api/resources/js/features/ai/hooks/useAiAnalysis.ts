import { useState, useEffect, useRef } from 'react';
import {
    detectAnswerConflicts,
    generateReviewedPlans,
    mapAnswersToPlanInput,
    type DesignConstraints,
    type Plan,
} from '@aihome/planner';
import { reviewProgram, type ProgramReview } from '../lib/program-review';
import { type AiSource, type AnalysisStepId } from '../types';
import { fetchAiConstraints } from '../lib/ai-client';
import { buildLocalConstraints } from '../lib/local-constraints';

export type AiAnalysisResult = {
    readonly constraints: DesignConstraints | undefined;
    readonly plans: readonly Plan[];
    readonly source: AiSource;
    readonly isDegraded: boolean;
    /** what the review changed in the program and why; plans are drawn from the reviewed program */
    readonly review?: ProgramReview | undefined;
};

type UseAiAnalysisOptions = {
    readonly answers: Record<string, unknown> | null;
    readonly onComplete: (result: AiAnalysisResult) => void;
};

function getAiSwitchMode(): 'off' | 'local' | 'remote' {
    if (typeof window === 'undefined') return 'remote';
    const hash = window.location.hash;
    if (hash.includes('ai=off')) return 'off';
    if (hash.includes('ai=local')) return 'local';
    return 'remote';
}

export function useAiAnalysis({ answers, onComplete }: UseAiAnalysisOptions): {
    readonly step: AnalysisStepId;
} {
    const [step, setStep] = useState<AnalysisStepId>('confirming');
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!answers) return;
        const currentAnswers = answers;
        const controller = new AbortController();
        const isAborted = (): boolean => controller.signal.aborted;

        async function runPipeline(): Promise<void> {
            setStep('confirming');
            await new Promise((r) => setTimeout(r, 400));
            if (isAborted()) return;

            setStep('analyzing');
            let constraints: DesignConstraints | undefined;
            let source: AiSource = 'local';
            let isDegraded = true;

            const mode = getAiSwitchMode();
            if (mode === 'local') {
                constraints = buildLocalConstraints(currentAnswers);
                source = 'local';
                isDegraded = true;
            } else if (mode === 'remote') {
                const aiResult = await fetchAiConstraints(
                    currentAnswers,
                    'ja',
                    controller.signal,
                );
                if (aiResult) {
                    constraints = aiResult.constraints;
                    source = aiResult.source;
                    isDegraded = aiResult.isDegraded;
                }
            }

            if (isAborted()) return;
            setStep('reviewing');
            const mapped = mapAnswersToPlanInput(currentAnswers);
            const review = await reviewProgram({
                input: mapped.input,
                constraints,
                answerConflicts: detectAnswerConflicts(currentAnswers),
                isAiEnabled: mode === 'remote',
                signal: controller.signal,
            });

            if (isAborted()) return;
            setStep('generating');
            await new Promise((r) => setTimeout(r, 300));
            if (isAborted()) return;

            // a lot that cannot take any house gets an explanation, not a drawing
            const genResult = review.isBlocked
                ? null
                : generateReviewedPlans(
                      mapped.input,
                      constraints,
                      review.overrides,
                  );
            const plans = genResult?.ok ? genResult.data.plans : [];

            setStep('rendering');
            await new Promise((r) => setTimeout(r, 500));
            if (isAborted()) return;

            onCompleteRef.current({
                constraints,
                plans,
                source,
                isDegraded,
                review,
            });
        }

        void runPipeline();

        return () => {
            controller.abort();
        };
    }, [answers]);

    return { step };
}
