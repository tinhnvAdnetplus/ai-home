import { type BdmIssue } from '@aihome/bdm';
import { type PlannerConfig } from './config.js';
import { type Plan, type PlanInput } from './types.js';
import { type VariantDefinition } from './variants.js';
import { validateLayout } from './plan-validator.js';
import { generateVariantPlan } from './variant-generator.js';
import { solvePlan } from './solver-plan.js';

type VariantArgs =
    Parameters<typeof generateVariantPlan> extends [
        unknown,
        unknown,
        unknown,
        unknown,
        ...infer Rest,
    ]
        ? Rest
        : never;

function alternatives(v: VariantDefinition): VariantDefinition[] {
    const list: VariantDefinition[] = [v, { ...v, isLdkFirst: true }];
    for (const hasLdkHall of [true, false]) {
        for (const fillerPos of ['end', 'mid', 'start'] as const) {
            for (const isMirror of [v.isMirror, !v.isMirror]) {
                list.push({
                    ...v,
                    isMirror,
                    narrow: { fillerPos, hasLdkHall },
                });
            }
        }
    }
    list.push(
        { ...v, aspect: v.aspect * 0.88 },
        { ...v, aspect: v.aspect * 1.14 },
    );
    return list;
}

function countErrors(issues: readonly BdmIssue[]): number {
    return issues.filter((i) => i.level === 'error').length;
}

/** Lower is better: hard errors dominate, then shrunk/dropped rooms, wasted hall area, area deviation. */
function penalty(plan: Plan, issues: readonly BdmIssue[]): number {
    const codes = plan.warnings.map((w) => w.code);
    const reduced = codes.filter((c) =>
        c.startsWith('ROOM_SIZE_REDUCED'),
    ).length;
    const dropped = codes.filter((c) => c.startsWith('ROOM_DROPPED')).length;
    const floors = plan.model.floors;
    const total = floors.reduce(
        (a, f) => a + f.rooms.reduce((x, r) => x + r.areaM2, 0),
        0,
    );
    const hall = floors.reduce(
        (a, f) =>
            a +
            f.rooms
                .filter((r) => r.type === 'hall')
                .reduce((x, r) => x + r.areaM2, 0),
        0,
    );
    const hallPct = total > 0 ? (hall / total) * 100 : 0;
    const dev = codes.includes('TOTAL_AREA_DEVIATION') ? 10 : 0;
    return (
        countErrors(issues) * 1000 +
        reduced * 30 +
        dropped * 50 +
        Math.max(0, hallPct - 10) * 4 +
        dev -
        plan.score.total * 0.5
    );
}

/**
 * Draw a variant, check the layout with exact geometric rules and redraw with
 * alternative parameters when a hard rule (outside lot, void cells, unreachable
 * room, stair without landing) is broken. Remaining issues are reported as warnings.
 */
export function generateValidatedVariant(
    input: PlanInput,
    variant: VariantDefinition,
    config: PlannerConfig,
    seed: number,
    ...rest: VariantArgs
): Plan {
    let best: {
        plan: Plan;
        issues: BdmIssue[];
        attempt: number;
        score: number;
    } | null = null;
    for (const [attempt, alt] of alternatives(variant).entries()) {
        const plan = generateVariantPlan(input, alt, config, seed, ...rest);
        const issues = validateLayout(plan.model);
        const score = penalty(plan, issues);
        if (!best || score < best.score)
            best = { plan, issues, attempt, score };
    }
    if (!best) throw new Error('No layout candidate generated');
    // the band planner's house sticks out of the lot: the lot-first solver sizes the
    // house from the buildable area instead
    if (best.issues.some((i) => i.code === 'LAYOUT_OUTSIDE_LOT')) {
        const solved = solvePlan(input, variant, config, seed);
        if (solved && countErrors(validateLayout(solved.model)) === 0)
            return solved;
    }
    const notes: BdmIssue[] =
        best.attempt > 0
            ? [
                  {
                      path: ['layout'],
                      code: 'LAYOUT_REDRAWN',
                      message:
                          '検証で問題が見つかったため、レイアウトを描き直しました。',
                      level: 'info',
                  },
              ]
            : [];
    return {
        ...best.plan,
        warnings: [...best.plan.warnings, ...notes, ...best.issues],
    };
}
