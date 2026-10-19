import { type PlanInput, type Plan } from './types.js';
import { type PlannerConfig } from './config.js';
import { type VariantDefinition } from './variants.js';
import { checkAiLayout } from './ai-layout-check.js';
import { planFromAiLayout } from './ai-layout-plan.js';
import { lotOverflow } from './lot-fit.js';
import { hasOpenParking, houseFrontageM } from './site-layout.js';
import { SITE_FITS } from './site-fit.js';
import { solveLayout } from './solver-search.js';

/**
 * A plan from the lot-first solver: for each site layout (parking in front or beside the
 * house, standard or tight setbacks) it sizes the outline from the buildable area and fits the
 * rooms into it. The first layout that passes every geometric check and stays on the lot wins.
 * Null when none does (the caller keeps the band planner's plan and its warnings).
 */
export function solvePlan(
    input: PlanInput,
    variant: VariantDefinition,
    config: PlannerConfig,
    seed: number,
): Plan | null {
    const v = variant.adjust(input);
    for (const fit of SITE_FITS) {
        const fv: PlanInput = { ...v, ...fit };
        if (fit.parkingPlacement === 'side') {
            if (!hasOpenParking(fv) || houseFrontageM(fv) < 1.0 + 6 * 0.91)
                continue;
        }
        const layout = solveLayout(fv, variant.isMirror);
        if (!layout || checkAiLayout(layout, fv).length > 0) continue;
        const plan = planFromAiLayout(fv, layout, variant, config, seed);
        if (plan.warnings.some((w) => w.level === 'error')) continue;
        if (lotOverflow(plan.model)) continue;
        return {
            ...plan,
            source: 'rules',
            warnings: [
                ...plan.warnings,
                {
                    path: ['layout'],
                    code: 'LAYOUT_FITTED_TO_LOT',
                    message:
                        '敷地に収まるよう、建物の外形を敷地から決めて間取りを組み直しました。',
                    level: 'info',
                },
            ],
        };
    }
    return null;
}
