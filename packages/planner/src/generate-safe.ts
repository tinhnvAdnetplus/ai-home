import { type SafePlanResult } from './types.js';
import { type PlannerConfig } from './config.js';
import { planInputSchema } from './input-schema.js';
import { normalizePlanInput } from './input-normalize.js';
import { isRecord } from './input-presets.js';
import { mapAnswersToPlanInput } from './answers-mapping.js';
import {
    type DesignConstraints,
    DesignConstraintsSchema,
} from './constraints.js';
import { generatePlans } from './generate.js';
import { type BdmIssue } from '@aihome/bdm';

function isPlannerConfig(obj: unknown): obj is Partial<PlannerConfig> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        ('cellM2' in obj || 'gridMm' in obj || 'unitPricePerTsubo' in obj)
    );
}

export function generatePlansSafe(
    unknownInput: unknown,
    constraints?: unknown,
    configPartial?: Partial<PlannerConfig>,
    seed = 42,
): SafePlanResult {
    try {
        let effConstraints: unknown = constraints;
        let effConfig: Partial<PlannerConfig> | undefined = configPartial;
        let effSeed = seed;

        if (typeof configPartial === 'number') {
            effSeed = configPartial;
            if (isPlannerConfig(constraints)) {
                effConfig = constraints;
            }
            effConstraints = undefined;
        } else if (isPlannerConfig(constraints)) {
            effConfig = constraints;
            effConstraints = undefined;
        }

        const rec = isRecord(unknownInput) ? unknownInput : {};
        const { input: mappedInput } = mapAnswersToPlanInput(rec);
        const normalized = normalizePlanInput({ ...mappedInput, ...rec });
        const parsed = planInputSchema.safeParse(normalized);
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

        let validConstraints: DesignConstraints | undefined;
        const extraWarnings: BdmIssue[] = [];

        if (effConstraints !== undefined && effConstraints !== null) {
            const parsedC = DesignConstraintsSchema.safeParse(effConstraints);
            if (parsedC.success) {
                validConstraints = parsedC.data;
            } else {
                extraWarnings.push({
                    path: ['constraints'],
                    code: 'CONSTRAINTS_INVALID',
                    message:
                        'Design constraints failed validation and were ignored',
                    level: 'warn',
                });
            }
        }

        const result = generatePlans(
            parsed.data,
            validConstraints,
            effConfig,
            effSeed,
        );
        if (extraWarnings.length > 0) {
            return {
                ok: true,
                data: {
                    plans: result.plans,
                    warnings: [...extraWarnings, ...result.warnings],
                    appliedConstraints: result.appliedConstraints,
                },
            };
        }
        return { ok: true, data: result };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'Unknown generation exception';
        return {
            ok: false,
            issues: [
                { path: [], code: 'GENERATION_ERROR', message, level: 'error' },
            ],
        };
    }
}
