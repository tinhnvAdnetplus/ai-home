import {
    applyAdjustments,
    assessFeasibility,
    buildBriefContext,
    effectiveProgram,
    inputCorrections,
    localReview,
    measureWhatIfs,
    isFloorsFlexible,
    type AnswerConflict,
    type AppliedAdjustment,
    type DesignConstraints,
    type FeasibilityIssue,
    type FeasibilityReport,
    type PlanInput,
} from '@aihome/planner';
import { fetchAiBrief, type AiBrief } from './ai-brief-client';

export type ProgramReview = {
    /** program changes for the planner (applied after the constraints) */
    readonly overrides: Partial<PlanInput>;
    readonly adjustments: readonly AppliedAdjustment[];
    readonly summary: string;
    readonly suggestions: readonly string[];
    readonly questions: readonly string[];
    /** problems that remain with the program the plans are drawn from */
    readonly issues: readonly FeasibilityIssue[];
    readonly isFeasible: boolean;
    readonly isBlocked: boolean;
    /** who chose the changes: the AI, the rule fallback, or nobody (nothing needed or nothing worked) */
    readonly source: 'ai' | 'rule' | 'none';
};

const MAX_AI_ROUNDS = 3;

function finish(
    report: FeasibilityReport,
    overrides: Partial<PlanInput>,
    adjustments: readonly AppliedAdjustment[],
    source: ProgramReview['source'],
    brief: AiBrief | null,
): ProgramReview {
    return {
        overrides,
        adjustments,
        summary: brief?.summary ?? '',
        suggestions: brief?.suggestions ?? [],
        questions: brief?.questions ?? [],
        issues: report.issues,
        isFeasible: report.isFeasible,
        isBlocked: report.isBlocked,
        source,
    };
}

/**
 * Reviews the customer's program before anything is drawn. The code corrects contradictory
 * input and measures the lot; the AI decides which wishes to drop or shrink (choosing among
 * changes the code has measured) and explains why; the code re-measures every AI answer and
 * sends back what is still wrong. Without the AI, or when it cannot fix the program, the
 * measured rule ladder takes over. A program that still cannot fit keeps the customer's wishes.
 */
export async function reviewProgram(args: {
    readonly input: PlanInput;
    readonly constraints?: DesignConstraints | undefined;
    /** answers that contradict each other (detectAnswerConflicts) */
    readonly answerConflicts?: readonly AnswerConflict[] | undefined;
    readonly isAiEnabled: boolean;
    readonly signal?: AbortSignal | undefined;
}): Promise<ProgramReview> {
    const { input, constraints, isAiEnabled, signal } = args;
    const conflicts = args.answerConflicts ?? [];
    const options = { isFloorsFlexible: isFloorsFlexible(conflicts) };
    const base = effectiveProgram(input, constraints);
    const corr = applyAdjustments(base, inputCorrections(base));
    let overrides: Partial<PlanInput> = corr.overrides;
    let applied: AppliedAdjustment[] = [...corr.applied];
    let report = assessFeasibility(input, constraints, overrides);
    let brief: AiBrief | null = null;
    let lastGood: AiBrief | null = null;

    if (isAiEnabled) {
        let issues: string[] | undefined;
        for (let round = 0; round < MAX_AI_ROUNDS; round += 1) {
            const whatIfs = measureWhatIfs(
                input,
                constraints,
                overrides,
                report,
                options,
            );
            const context = buildBriefContext({
                program: effectiveProgram(input, constraints, overrides),
                constraints,
                report,
                corrections: corr.applied,
                whatIfs,
                answerConflicts: conflicts,
            });
            brief = await fetchAiBrief(
                context,
                issues,
                brief ?? undefined,
                signal,
            );
            if (!brief || signal?.aborted) break;
            // a program that already fits gives up nothing: only the AI's additions are taken
            const isAlreadyFeasible = report.isFeasible;
            const proposed = brief.adjustments
                .filter((a) => !isAlreadyFeasible || a.action === 'add')
                .map((a) => ({ ...a, source: 'ai' as const }));
            const res = applyAdjustments(
                effectiveProgram(input, constraints, overrides),
                proposed,
            );
            const tryOv = { ...overrides, ...res.overrides };
            const tryReport = assessFeasibility(input, constraints, tryOv);
            // keep the AI's changes when they fit, or at least bring the house closer to fitting;
            // additions that would push a fitting house off the lot are refused
            const isBetter =
                tryReport.isFeasible ||
                (!report.isFeasible && tryReport.excess < report.excess);
            if (isBetter) {
                overrides = tryOv;
                applied = [...applied, ...res.applied];
                report = tryReport;
                lastGood = brief;
            }
            if (report.isFeasible || report.isBlocked) break;
            issues = [
                ...report.issues.map((i) => i.message),
                ...(isBetter
                    ? []
                    : ['前回の変更では改善しなかったため適用していません。']),
                ...res.rejected.map((r) => `適用できない変更: ${r.why}`),
            ].slice(0, 12);
        }
    }

    if (report.isFeasible) {
        const source = applied.some((a) => a.source === 'ai') ? 'ai' : 'none';
        return finish(report, overrides, applied, source, lastGood ?? brief);
    }
    if (!report.isBlocked) {
        const local = localReview(input, constraints, options);
        if (local.report.isFeasible) {
            return finish(
                local.report,
                local.overrides,
                local.applied,
                'rule',
                null,
            );
        }
    }
    // nothing fits: keep the customer's wishes (only input corrections) and say so
    const kept = assessFeasibility(input, constraints, corr.overrides);
    return finish(kept, corr.overrides, corr.applied, 'none', {
        summary: '',
        adjustments: [],
        suggestions: [],
        questions: brief?.questions ?? [],
    });
}
