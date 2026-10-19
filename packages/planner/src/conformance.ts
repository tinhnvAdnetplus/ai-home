import { type Plan } from './types.js';
import { mapAnswersToPlanInput } from './answers-mapping.js';
import {
    type ConformanceCheck,
    type ConformanceReport,
    shoelaceAreaM2,
} from './conformance-helpers.js';
import { buildBasicChecks } from './conformance-basic-checks.js';
import { buildAmenityChecks } from './conformance-amenity-checks.js';

function buildChecks(
    answers: Record<string, unknown>,
    plan: Plan,
): ConformanceCheck[] {
    const { input } = mapAnswersToPlanInput(answers);
    const m = plan.model;
    const allRooms = m.floors.flatMap((f) => f.rooms);

    const nonVoidRooms = allRooms.filter(
        (r) => r.type !== 'void' && r.type !== 'balcony',
    );
    const actM2 = nonVoidRooms.reduce(
        (s, r) => s + shoelaceAreaM2(r.polygon),
        0,
    );

    const basicChecks = buildBasicChecks(input, plan, allRooms, actM2);
    const amenityChecks = buildAmenityChecks(input, plan, allRooms);

    return [...basicChecks, ...amenityChecks];
}

export function checkPlanConformance(
    answers: Record<string, unknown>,
    _appliedConstraints: readonly string[] | undefined,
    plan: Plan,
): ConformanceReport {
    const checks = buildChecks(answers, plan);
    const passedCount = checks.filter((c) => c.status === 'pass').length;
    const failedCount = checks.filter((c) => c.status === 'fail').length;
    const naCount = checks.filter((c) => c.status === 'na').length;
    const isOk = failedCount === 0;

    return { ok: isOk, passedCount, failedCount, naCount, checks };
}
