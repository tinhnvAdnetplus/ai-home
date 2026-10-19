import {
    generateReviewedPlans,
    localReview,
    mapAnswersToPlanInput,
    type DesignConstraints,
    type Plan,
    type PlanInput,
} from '@aihome/planner';

/**
 * Plans for refined answers: the same lot check as the first run (input corrections and the
 * measured rule ladder), without another AI round trip. Null when generation fails.
 */
export function planForAnswers(
    answers: Record<string, unknown>,
    constraints: DesignConstraints | undefined,
): { plans: readonly Plan[]; overrides: Partial<PlanInput> } | null {
    const mapped = mapAnswersToPlanInput(answers);
    const local = localReview(mapped.input, constraints);
    const res = generateReviewedPlans(
        mapped.input,
        constraints,
        local.overrides,
    );
    return res.ok
        ? { plans: res.data.plans, overrides: local.overrides }
        : null;
}
