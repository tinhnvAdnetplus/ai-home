import { type PlanInput, type SafePlanResult } from './types.js';
import { type DesignConstraints } from './constraints.js';
import { planInputSchema } from './input-schema.js';
import { generatePlans } from './generate.js';

/**
 * Plans for a reviewed program: the mapped input, the AI constraints, then the review's
 * overrides on top (so the constraints cannot add back what the review removed).
 */
export function generateReviewedPlans(
    input: PlanInput,
    constraints?: DesignConstraints,
    overrides?: Partial<PlanInput>,
): SafePlanResult {
    const parsed = planInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            issues: parsed.error.issues.map((err) => ({
                path: err.path,
                code: 'INPUT_INVALID',
                message: err.message,
                level: 'error',
            })),
        };
    }
    try {
        return {
            ok: true,
            data: generatePlans(
                parsed.data,
                constraints,
                undefined,
                42,
                overrides,
            ),
        };
    } catch (err: unknown) {
        return {
            ok: false,
            issues: [
                {
                    path: [],
                    code: 'GENERATION_ERROR',
                    message:
                        err instanceof Error
                            ? err.message
                            : 'Unknown generation exception',
                    level: 'error',
                },
            ],
        };
    }
}
