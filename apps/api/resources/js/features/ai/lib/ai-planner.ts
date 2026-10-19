import {
    VARIANTS,
    buildAiLayoutContext,
    checkAiLayout,
    defaultPlannerConfig,
    effectiveProgram,
    mapAnswersToPlanInput,
    parseAiLayout,
    planFromAiLayout,
    type DesignConstraints,
    type Plan,
    type PlanInput,
} from '@aihome/planner';
import { fetchAiLayout } from './ai-layout-client';

const MAX_ATTEMPTS = 3;

export type AiPlannerResult = {
    readonly plans: readonly Plan[];
    /** how many of the plans were designed by the AI (the rest fall back to the rule-based plan) */
    readonly aiCount: number;
};

async function designOne(
    input: PlanInput,
    variantIndex: number,
    signal?: AbortSignal,
): Promise<Plan | null> {
    const variant = VARIANTS[variantIndex];
    if (!variant) return null;
    const seed = 42 + variantIndex;
    const context = buildAiLayoutContext(input, variant, seed);
    let issues: string[] | undefined;
    let previous: unknown;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const raw = await fetchAiLayout(context, issues, previous, signal);
        if (raw === null) return null;
        const parsed = parseAiLayout(raw);
        if (!parsed.layout) {
            issues = parsed.errors;
            previous = raw;
            continue;
        }
        const structural = checkAiLayout(parsed.layout, input, {
            shouldRequireDoors: true,
        });
        if (structural.length === 0) {
            const plan = planFromAiLayout(
                input,
                parsed.layout,
                variant,
                defaultPlannerConfig,
                seed,
            );
            const hard = plan.warnings.filter((w) => w.level === 'error');
            if (hard.length === 0) return plan;
            issues = hard.map((w) => w.message).slice(0, 12);
        } else {
            issues = structural.slice(0, 12);
        }
        previous = parsed.layout;
    }
    return null;
}

/**
 * AI designs the three variants in parallel. Each layout is checked with exact geometry rules;
 * on failure the issues are sent back to the AI (max 3 attempts). A variant the AI cannot get
 * right keeps its rule-based plan, so the result is never worse than the default.
 */
export async function generateAiPlans(args: {
    readonly answers: Record<string, unknown>;
    readonly constraints?: DesignConstraints | undefined;
    readonly overrides?: Partial<PlanInput> | undefined;
    readonly fallback: readonly Plan[];
    readonly signal?: AbortSignal | undefined;
    readonly onVariantDone?:
        ((done: number, total: number) => void) | undefined;
}): Promise<AiPlannerResult> {
    const base = mapAnswersToPlanInput(args.answers).input;
    const input = effectiveProgram(base, args.constraints, args.overrides);
    let done = 0;
    const designed = await Promise.all(
        VARIANTS.map(async (_, i) => {
            const plan = await designOne(input, i, args.signal);
            done += 1;
            args.onVariantDone?.(done, VARIANTS.length);
            return plan;
        }),
    );
    const plans = args.fallback.map((fb, i) => designed[i] ?? fb);
    return { plans, aiCount: designed.filter((p) => p !== null).length };
}
