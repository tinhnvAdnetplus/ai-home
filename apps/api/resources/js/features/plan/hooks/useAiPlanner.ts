import { useCallback, useState } from 'react';
import {
    type DesignConstraints,
    type Plan,
    type PlanInput,
} from '@aihome/planner';
import { generateAiPlans } from '@/features/ai';

export type AiPlannerState = {
    readonly status: 'idle' | 'running' | 'done' | 'failed';
    readonly progress: number;
    readonly aiCount: number;
    readonly isShowingAi: boolean;
    readonly run: () => void;
    readonly restoreRules: () => void;
};

type Params = {
    readonly answers: Record<string, unknown>;
    readonly constraints: DesignConstraints | undefined;
    /** program changes from the lot review, so the AI designs the reviewed program */
    readonly overrides?: Partial<PlanInput> | undefined;
    readonly rulePlans: readonly Plan[];
    readonly setPlans: (plans: readonly Plan[]) => void;
};

/** Experimental: let the AI design the three layouts, keeping the rule-based plans as fallback. */
export function useAiPlanner({
    answers,
    constraints,
    overrides,
    rulePlans,
    setPlans,
}: Params): AiPlannerState {
    const [status, setStatus] = useState<AiPlannerState['status']>('idle');
    const [progress, setProgress] = useState(0);
    const [aiCount, setAiCount] = useState(0);
    const [isShowingAi, setIsShowingAi] = useState(false);

    const run = useCallback((): void => {
        setStatus('running');
        setProgress(0);
        void generateAiPlans({
            answers,
            constraints,
            overrides,
            fallback: rulePlans,
            onVariantDone: (done) => {
                setProgress(done);
            },
        }).then((res) => {
            if (res.aiCount > 0) {
                setPlans(res.plans);
                setAiCount(res.aiCount);
                setIsShowingAi(true);
                setStatus('done');
            } else {
                setStatus('failed');
            }
        });
    }, [answers, constraints, overrides, rulePlans, setPlans]);

    const restoreRules = useCallback((): void => {
        setPlans(rulePlans);
        setIsShowingAi(false);
        setStatus('idle');
    }, [rulePlans, setPlans]);

    return { status, progress, aiCount, isShowingAi, run, restoreRules };
}
