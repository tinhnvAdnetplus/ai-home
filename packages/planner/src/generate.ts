import { type PlanInput, type Plan, type PlanResult } from './types.js';
import { type PlannerConfig, defaultPlannerConfig } from './config.js';
import { VARIANTS, type VariantDefinition } from './variants.js';
import { type DesignConstraints } from './constraints.js';
import { applyDesignConstraints } from './constraints-apply.js';
import { generateValidatedVariant } from './generate-validated.js';

export { generatePlansSafe } from './generate-safe.js';

export function generatePlans(
    input: PlanInput,
    constraints?: DesignConstraints,
    configPartial?: Partial<PlannerConfig>,
    seed = 42,
    /** program changes from the feasibility review; applied after the constraints so they are not undone */
    overrides?: Partial<PlanInput>,
): PlanResult {
    const config: PlannerConfig = { ...defaultPlannerConfig, ...configPartial };
    const [vA, vB, vC] = VARIANTS;
    if (!vA || !vB || !vC) throw new Error('Variants resolution failed');

    const variantMap: Record<'A' | 'B' | 'C', VariantDefinition> = {
        A: vA,
        B: vB,
        C: vC,
    };

    let effectiveInput = input;
    let customWeights:
        | {
              housework: number;
              storage: number;
              daylight: number;
              budget: number;
          }
        | undefined;
    let appliedList: readonly string[] | undefined;
    let unsatisfiedList: readonly string[] | undefined;
    let chosenVariants: VariantDefinition[] = [vA, vB, vC];

    if (constraints) {
        const res = applyDesignConstraints(input, constraints);
        effectiveInput = res.input;
        customWeights = res.weights;
        appliedList = res.applied;
        unsatisfiedList = res.unsatisfied;
        chosenVariants = res.preferredVariantOrder.map((id) => variantMap[id]);
    }

    if (overrides) effectiveInput = { ...effectiveInput, ...overrides };

    const [v1, v2, v3] = chosenVariants;
    if (!v1 || !v2 || !v3) throw new Error('Variants resolution failed');

    const plan1 = generateValidatedVariant(
        effectiveInput,
        v1,
        config,
        seed,
        customWeights,
        appliedList,
        unsatisfiedList,
    );
    const plan2 = generateValidatedVariant(
        effectiveInput,
        v2,
        config,
        seed + 1,
        customWeights,
        appliedList,
        unsatisfiedList,
    );
    const plan3 = generateValidatedVariant(
        effectiveInput,
        v3,
        config,
        seed + 2,
        customWeights,
        appliedList,
        unsatisfiedList,
    );

    const plans: [Plan, Plan, Plan] = [plan1, plan2, plan3];
    return {
        plans,
        warnings: [...plan1.warnings, ...plan2.warnings, ...plan3.warnings],
        appliedConstraints:
            appliedList && appliedList.length > 0 ? appliedList : undefined,
    };
}
