import { type PlanInput } from './types.js';
import { type DesignConstraints } from './constraints.js';
import { type FeasibilityReport } from './feasibility.js';
import { describeKnobs, type AppliedAdjustment } from './brief.js';
import { type WhatIf } from './review.js';
import { type AnswerConflict } from './answers-conflicts.js';

/** The program fields the review talks about, as the AI reads them. */
function programView(p: PlanInput): Record<string, unknown> {
    return {
        floors: p.floors,
        targetArea: p.targetArea,
        landAreaTsubo: p.landAreaTsubo,
        ldkSize: p.ldkSize,
        masterSize: p.masterSize,
        kidsRooms: p.kidsRooms,
        kidsSize: p.kidsSize,
        tatamiRoom: p.tatamiRoom ?? 'なし',
        toilets: p.toilets,
        bath: p.bathSize,
        cars: p.cars,
        parkingType: p.parkingType ?? '青空',
        extraRooms: p.extraRooms ?? [],
        waterOpts: p.waterOpts ?? [],
        storageOpts: p.storageOpts ?? [],
        outdoorOpts: p.outdoorOpts ?? [],
        kitchenType: p.kitchenType ?? '',
        workFromHome: p.wfh ?? '',
    };
}

/**
 * Everything the AI needs to judge the request: the program, the family, what the customer
 * values most, the measured lot facts and what it is allowed to change. The free text reaches
 * the AI only as the constraints step already summarised it.
 */
export function buildBriefContext(args: {
    readonly program: PlanInput;
    readonly constraints?: DesignConstraints | undefined;
    readonly report: FeasibilityReport;
    readonly corrections: readonly AppliedAdjustment[];
    readonly whatIfs: readonly WhatIf[];
    readonly answerConflicts?: readonly AnswerConflict[] | undefined;
}): Record<string, unknown> {
    const { program: p, constraints: c, report } = args;
    return {
        lot: {
            frontageM: p.frontage,
            depthM: p.landDepth,
            roadSide: p.roadSide,
            shape: p.landShape ?? '長方形',
            surroundings: p.surroundings ?? [],
        },
        family: {
            adults: p.adults ?? 2,
            children: p.children ?? 0,
            twoGenerations: p.twoGen ?? '',
            future: p.futureFamily ?? '',
        },
        budgetManYen: p.budget ?? null,
        program: programView(p),
        customerPriorities: {
            selected: p.priorities ?? [],
            mustHave: p.mustHave ?? [],
            notNeeded: p.notNeeded ?? [],
            weights: c?.priorities ?? null,
            oneLevelLiving: c?.accessibility.oneLevelLiving ?? false,
            pets: c?.pets ?? false,
            workFromHome: c?.workFromHome ?? false,
            summary: c?.summary ?? '',
            notes: c?.notes ?? [],
            otherRequests: c?.unmappedRequests ?? [],
        },
        feasibility: {
            isFeasible: report.isFeasible,
            lot: report.lot,
            drawnResult: report.outcome,
            issues: report.issues.map((i) => ({
                code: i.code,
                message: i.message,
            })),
            excessNow: report.excess,
            // each change tried alone and measured by the planner
            whatIf: args.whatIfs,
        },
        // the customer's answers that contradict each other (the planner used the first-named one)
        answerConflicts: (args.answerConflicts ?? []).map((c) => c.message),
        inputCorrectionsAlreadyMade: args.corrections.map((a) => ({
            field: a.field,
            from: a.from,
            to: a.value,
            reason: a.reason,
        })),
        allowedChanges: describeKnobs(),
    };
}
