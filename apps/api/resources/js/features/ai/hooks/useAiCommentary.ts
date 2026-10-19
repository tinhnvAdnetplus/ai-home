import { useState, useEffect, useCallback, useRef } from 'react';
import { type DesignConstraints, type Plan } from '@aihome/planner';
import { type AiCommentaryResponse } from '../types';
import { fetchAiCommentary } from '../lib/ai-client';
import { buildLocalCommentary } from '../lib/local-commentary';

type UseAiCommentaryProps = {
    readonly answers: Record<string, unknown>;
    readonly constraints: DesignConstraints | undefined;
    readonly plans: readonly Plan[];
};

function getAiSwitchMode(): 'off' | 'local' | 'remote' {
    if (typeof window === 'undefined') return 'remote';
    const hash = window.location.hash;
    if (hash.includes('ai=off')) return 'off';
    if (hash.includes('ai=local')) return 'local';
    return 'remote';
}

export function useAiCommentary({
    answers,
    constraints,
    plans,
}: UseAiCommentaryProps): {
    readonly commentary: AiCommentaryResponse | null;
    readonly isLoading: boolean;
    readonly isError: boolean;
    readonly retry: () => void;
} {
    const [commentary, setCommentary] = useState<AiCommentaryResponse | null>(
        () => {
            if (getAiSwitchMode() === 'local' && plans.length > 0) {
                return buildLocalCommentary(plans);
            }
            return null;
        },
    );
    const [isLoading, setIsLoading] = useState<boolean>(() => {
        const mode = getAiSwitchMode();
        return mode === 'remote' && plans.length > 0;
    });
    const [isError, setIsError] = useState<boolean>(false);
    const [attempt, setAttempt] = useState<number>(0);

    const retry = useCallback(() => {
        setAttempt((prev) => prev + 1);
    }, []);

    const paramsRef = useRef({ answers, constraints, plans });
    useEffect(() => {
        paramsRef.current = { answers, constraints, plans };
    }, [answers, constraints, plans]);

    useEffect(() => {
        const controller = new AbortController();
        const isAborted = (): boolean => controller.signal.aborted;

        async function load(): Promise<void> {
            await Promise.resolve();
            if (isAborted()) return;

            const currentParams = paramsRef.current;
            if (currentParams.plans.length === 0) {
                setIsLoading(false);
                return;
            }

            const mode = getAiSwitchMode();
            if (mode === 'off') {
                setIsLoading(false);
                return;
            }

            if (mode === 'local') {
                setCommentary(buildLocalCommentary(currentParams.plans));
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setIsError(false);

            const result = await fetchAiCommentary(
                currentParams.answers,
                currentParams.constraints,
                currentParams.plans,
                controller.signal,
            );

            if (isAborted()) return;

            if (result) {
                setCommentary(result);
                setIsLoading(false);
            } else {
                setIsError(true);
                setIsLoading(false);
            }
        }

        void load();

        return () => {
            controller.abort();
        };
    }, [attempt]);

    return {
        commentary,
        isLoading,
        isError,
        retry,
    };
}
