import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type Plan, type DesignConstraints } from '@aihome/planner';
import {
    useAiCommentary,
    type AiCommentaryItem,
    type AiSource,
    type ProgramReview,
} from '@/features/ai';
import { type MaterialOptions } from '@aihome/render3d';
import { resolveMaterialsFromAnswers } from '../lib/materials-resolver';
import { getRecommendedPlanId } from '../lib/plan-metrics';
import { planForAnswers } from '../lib/plan-for-answers';
import { getInitialViewMode } from '../lib/plan-view-helpers';
import { useAiPlanner, type AiPlannerState } from './useAiPlanner';
import { type PlanViewMode } from '../components/PlanViewSwitcher';

export type UsePlanResultsParams = {
    readonly initialPlans: readonly Plan[];
    readonly initialAnswers?: Record<string, unknown> | undefined;
    readonly constraints?: DesignConstraints | undefined;
    readonly aiSource?: AiSource | undefined;
    readonly isDegraded?: boolean | undefined;
    readonly review?: ProgramReview | undefined;
};

export type PlanResultsProps = {
    readonly plans: readonly Plan[];
    readonly answers?: Record<string, unknown> | undefined;
    readonly constraints?: DesignConstraints | undefined;
    readonly aiSource?: AiSource | undefined;
    readonly isDegraded?: boolean | undefined;
    readonly review?: ProgramReview | undefined;
    readonly projectId?: number | null | undefined;
    readonly onBack?: (() => void) | undefined;
    readonly onEditAnswers?: (() => void) | undefined;
};

export type UsePlanResultsReturn = {
    readonly currentPlans: readonly Plan[];
    readonly currentAnswers: Record<string, unknown>;
    readonly activePlan: Plan | undefined;
    readonly recommendedId: string;
    readonly commentary: ReturnType<typeof useAiCommentary>['commentary'];
    readonly activeCommentary: AiCommentaryItem | undefined;
    readonly materials: MaterialOptions;
    readonly viewMode: PlanViewMode;
    readonly isRegenerating: boolean;
    readonly isLoading: boolean;
    readonly isError: boolean;
    readonly retry: () => void;
    readonly setViewMode: (mode: PlanViewMode) => void;
    readonly setUserSelectedId: (id: string) => void;
    readonly handleRefine: (
        newAnswers: Record<string, unknown>,
        freeText?: string,
    ) => void;
    readonly aiPlanner: AiPlannerState;
};

export function usePlanResults({
    initialPlans,
    initialAnswers = {},
    constraints,
    review,
}: UsePlanResultsParams): UsePlanResultsReturn {
    const [currentPlans, setCurrentPlans] =
        useState<readonly Plan[]>(initialPlans);
    const [currentAnswers, setCurrentAnswers] =
        useState<Record<string, unknown>>(initialAnswers);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [overrides, setOverrides] = useState(review?.overrides);
    const [viewMode, setViewMode] = useState<PlanViewMode>(getInitialViewMode);
    const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

    const { commentary, isLoading, isError, retry } = useAiCommentary({
        answers: currentAnswers,
        constraints,
        plans: currentPlans,
    });

    const recommendedId = useMemo(
        () => getRecommendedPlanId(currentPlans, commentary?.recommendedLabel),
        [currentPlans, commentary],
    );

    const activeId = userSelectedId ?? recommendedId;
    const activePlan = useMemo(
        () => currentPlans.find((p) => p.id === activeId) ?? currentPlans[0],
        [currentPlans, activeId],
    );
    const materials = useMemo(
        () => resolveMaterialsFromAnswers(currentAnswers, activePlan?.model.exterior),
        [currentAnswers, activePlan],
    );

    const activeCommentary = useMemo(() => {
        if (!commentary || !activePlan) return undefined;
        return commentary.items.find(
            (item) =>
                item.label === activePlan.label ||
                activePlan.label.includes(item.label),
        );
    }, [commentary, activePlan]);

    const handleRefine = useCallback(
        (newAnswers: Record<string, unknown>, freeText?: string): void => {
            setIsRegenerating(true);
            try {
                const nextAnswers = { ...newAnswers };
                if (freeText !== undefined && freeText !== '') {
                    nextAnswers.memo = freeText;
                }
                const next = planForAnswers(nextAnswers, constraints);
                if (next) {
                    setCurrentPlans(next.plans);
                    setCurrentAnswers(nextAnswers);
                    setOverrides(next.overrides);
                }
            } finally {
                setIsRegenerating(false);
            }
        },
        [constraints],
    );

    const aiPlanner = useAiPlanner({
        answers: currentAnswers,
        constraints,
        overrides,
        rulePlans: initialPlans,
        setPlans: setCurrentPlans,
    });

    // AI design is now the default engine: run it once automatically so the user sees it
    // without having to press the button. The rule-based plans above render instantly in the
    // meantime, and the button in AiPlannerBar stays available to redesign on demand (e.g. after
    // a refine, where we intentionally do NOT auto-rerun to keep that loop instant).
    const hasAutoRunRef = useRef(false);
    useEffect(() => {
        if (hasAutoRunRef.current) return;
        if (initialPlans.length === 0) return;
        hasAutoRunRef.current = true;
        aiPlanner.run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPlans]);

    return {
        aiPlanner,
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
    };
}
