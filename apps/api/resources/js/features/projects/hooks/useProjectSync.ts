import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SyncStatus } from '../components/ProjectSyncStatus';
import { PROJECTS_QUERY_KEY } from './useProjects';
import { useProjectHashLoader } from './useProjectHashLoader';
import {
    getDraftAnswersFromEvent,
    persistProjectAnswers,
    submitProjectWithPlans,
    type PlanItemPayload,
} from '../lib/project-sync-helpers';

export interface UseProjectSyncResult {
    readonly projectId: number | null;
    readonly status: SyncStatus;
    readonly loadedAnswers: Record<string, unknown> | null;
    readonly isProjectLoading: boolean;
    readonly projectError: string | null;
    readonly handleFinalSubmit: (
        plans?: readonly PlanItemPayload[],
    ) => Promise<boolean>;
}

export function useProjectSync(
    answers: Record<string, unknown> = {},
    stepIndex?: number,
): UseProjectSyncResult {
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<SyncStatus>('idle');
    const [activeAnswers, setActiveAnswers] =
        useState<Record<string, unknown>>(answers);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const answersRef = useRef<Record<string, unknown>>(activeAnswers);

    const handleLoaded = useCallback((loaded: Record<string, unknown>) => {
        setActiveAnswers(loaded);
    }, []);

    const {
        projectId,
        setProjectId,
        loadedAnswers,
        isProjectLoading,
        projectError,
        initialAnswersRef,
        hasInitializedRef,
    } = useProjectHashLoader(stepIndex ?? 0, handleLoaded);

    useEffect(() => {
        answersRef.current = activeAnswers;
    }, [activeAnswers]);

    useEffect(() => {
        function handleDraftSave(e: Event): void {
            const draft = getDraftAnswersFromEvent(e);
            if (draft)
                setActiveAnswers((isCurrent) => ({ ...isCurrent, ...draft }));
        }
        window.addEventListener('aihome:wizard-draft-save', handleDraftSave);
        return () => {
            window.removeEventListener(
                'aihome:wizard-draft-save',
                handleDraftSave,
            );
        };
    }, []);

    useEffect(() => {
        if (isProjectLoading || projectError !== null) return;
        if (Object.keys(activeAnswers).length === 0) return;
        if (
            initialAnswersRef.current &&
            JSON.stringify(activeAnswers) ===
                JSON.stringify(initialAnswersRef.current) &&
            !hasInitializedRef.current
        ) {
            return;
        }

        hasInitializedRef.current = true;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        setStatus('saving');

        debounceTimerRef.current = setTimeout(() => {
            void (async () => {
                try {
                    const result = await persistProjectAnswers(
                        projectId,
                        answersRef.current,
                    );
                    setProjectId(result.id);
                    initialAnswersRef.current = answersRef.current;
                    setStatus('saved');
                } catch {
                    setStatus('error');
                }
            })();
        }, 1500);

        return () => {
            if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current);
        };
    }, [
        activeAnswers,
        isProjectLoading,
        projectError,
        projectId,
        setProjectId,
        initialAnswersRef,
        hasInitializedRef,
    ]);

    const handleFinalSubmit = useCallback(
        async (plans?: readonly PlanItemPayload[]): Promise<boolean> => {
            if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current);

            try {
                const result = await persistProjectAnswers(
                    projectId,
                    answersRef.current,
                );
                setProjectId(result.id);
                await submitProjectWithPlans(result.id, plans);
                setStatus('saved');
                void queryClient.invalidateQueries({
                    queryKey: PROJECTS_QUERY_KEY,
                });
                return true;
            } catch {
                setStatus('error');
                return false;
            }
        },
        [projectId, setProjectId, queryClient],
    );

    return {
        projectId,
        status,
        loadedAnswers,
        isProjectLoading,
        projectError,
        handleFinalSubmit,
    };
}
