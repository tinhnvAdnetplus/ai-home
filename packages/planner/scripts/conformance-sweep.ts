import {
    generatePlansSafe,
    checkPlanConformance,
    type Plan,
} from '../src/index.ts';
import {
    DEFAULT_ANSWERS,
    FIELD_OPTIONS,
    generateAllAnswerSets,
} from './sweep-generator.ts';

function computePlanHash(p: Plan): string {
    return `${p.model.meta.inputHash}-${p.summary.floorAreaM2.toString()}-${p.summary.roomsList.join(',')}-${p.score.total.toString()}-${p.model.roof.kind}-${p.model.parking.spaces.toString()}-${p.model.parking.kind}-${p.model.site.road.side}-${p.model.site.areaM2.toString()}`;
}

async function runSweep(): Promise<void> {
    const sets = generateAllAnswerSets();
    console.log(
        `Starting conformance sweep with ${sets.length.toString()} answer sets...`,
    );

    const checkStats: Record<
        string,
        { pass: number; fail: number; na: number; label: string }
    > = {};
    const failures: {
        set: string;
        planId: string;
        checkId: string;
        expected: unknown;
        actual: unknown;
    }[] = [];
    const failCounts: Record<string, number> = {};

    for (const s of sets) {
        const res = generatePlansSafe(s.answers);
        if (!res.ok) {
            console.error(`Generation failed for set ${s.name}:`, res.issues);
            continue;
        }

        for (const plan of res.data.plans) {
            const report = checkPlanConformance(s.answers, undefined, plan);
            for (const c of report.checks) {
                const stat = checkStats[c.id] ?? {
                    pass: 0,
                    fail: 0,
                    na: 0,
                    label: c.label,
                };
                stat[c.status]++;
                checkStats[c.id] = stat;
                if (c.status === 'fail') {
                    const cnt = failCounts[c.id] ?? 0;
                    if (cnt < 2) {
                        failures.push({
                            set: s.name,
                            planId: plan.id,
                            checkId: c.id,
                            expected: c.expected,
                            actual: c.actual,
                        });
                        failCounts[c.id] = cnt + 1;
                    }
                }
            }
        }
    }

    // AI DesignConstraints Verification
    console.log('Testing AI DesignConstraints input & effects...');
    const testConstraints = {
        schemaVersion: 1 as const,
        summary: '在宅ワーク重視、収納多め、ペット対応の快適な平屋プラン',
        priorities: {
            housework: 5,
            storage: 4,
            daylight: 3,
            budget: 2,
            privacy: 4,
            family: 4,
        },
        mustHaveRooms: ['study', 'tatami', 'walkInCloset', 'pantry', 'laundry'],
        avoidRooms: ['balcony'],
        roomHints: [
            { room: 'ldk', sizeJo: 22 },
            { room: 'kids', count: 2, sizeJo: 5 },
        ],
        adjacency: [
            { a: 'kitchen', b: 'laundry', relation: 'adjacent' as const },
        ],
        orientation: {
            livingFacing: 'south' as const,
            entranceSide: 'south' as const,
        },
        accessibility: { oneLevelLiving: true, wideCorridors: true },
        pets: true,
        workFromHome: true,
        notes: ['家事動線をコンパクトに'],
        unmappedRequests: [],
    };
    const cRes = generatePlansSafe(DEFAULT_ANSWERS, testConstraints);
    if (
        !cRes.ok ||
        !cRes.data.appliedConstraints ||
        cRes.data.appliedConstraints.length === 0
    ) {
        console.error('Failed: Constraints not applied properly!');
    } else {
        console.log(
            `Constraints applied (${cRes.data.appliedConstraints.length.toString()} items):`,
            cRes.data.appliedConstraints.slice(0, 4).join(', '),
        );
    }

    // Invalid constraints check
    const invalidRes = generatePlansSafe(DEFAULT_ANSWERS, {
        schemaVersion: 999,
        invalid: true,
    });
    const hasInvalidWarn =
        invalidRes.ok &&
        invalidRes.data.warnings.some((w) => w.code === 'CONSTRAINTS_INVALID');
    console.log(
        `Invalid constraints rejected with CONSTRAINTS_INVALID: ${hasInvalidWarn.toString()}`,
    );

    // Sensitivity Test
    console.log('\nRunning field sensitivity analysis...');
    const baseRes = generatePlansSafe(DEFAULT_ANSWERS);
    const computeProposalHash = (plans: readonly Plan[]): string =>
        plans.map(computePlanHash).join('||');
    const baseHash = baseRes.ok ? computeProposalHash(baseRes.data.plans) : '';

    const sensitiveFields: string[] = [];
    const nonSensitiveFields: string[] = [];

    for (const [field, opts] of Object.entries(FIELD_OPTIONS)) {
        let isFieldSensitive = false;
        for (const opt of opts) {
            const modRes = generatePlansSafe({
                ...DEFAULT_ANSWERS,
                [field]: opt,
            });
            const modHash = modRes.ok
                ? computeProposalHash(modRes.data.plans)
                : '';
            if (modHash !== baseHash) {
                isFieldSensitive = true;
                break;
            }
        }
        if (isFieldSensitive) {
            sensitiveFields.push(field);
        } else {
            nonSensitiveFields.push(field);
        }
    }

    // Print Tables
    console.log(
        '\n=================== CONFORMANCE SWEEP RESULTS ===================',
    );
    console.log(
        '| Check ID                 | Label                | Pass | Fail | N/A |',
    );
    console.log(
        '|--------------------------|----------------------|------|------|-----|',
    );
    for (const [id, s] of Object.entries(checkStats)) {
        const idCol = id.padEnd(24, ' ');
        const labelCol = s.label.padEnd(20, ' ');
        const passCol = String(s.pass).padStart(4, ' ');
        const failCol = String(s.fail).padStart(4, ' ');
        const naCol = String(s.na).padStart(3, ' ');
        console.log(
            `| ${idCol} | ${labelCol} | ${passCol} | ${failCol} | ${naCol} |`,
        );
    }

    if (failures.length > 0) {
        console.log('\n--- First 10 Failing Checks ---');
        for (const f of failures) {
            console.log(
                `Set: ${f.set} [${f.planId}] - Check: ${f.checkId}, Expected: ${String(f.expected)}, Actual: ${String(f.actual)}`,
            );
        }
    } else {
        console.log('\n*** ZERO FAILURES DETECTED! ALL CHECKS PASSED ***');
    }

    console.log(
        `\nSensitivity: ${sensitiveFields.length.toString()} sensitive fields, ${nonSensitiveFields.length.toString()} non-sensitive fields.`,
    );
    if (nonSensitiveFields.length > 0) {
        console.log('Non-sensitive fields:', nonSensitiveFields.join(', '));
    }
}

runSweep().catch((err: unknown) => {
    console.error('Sweep failed with unhandled exception:', err);
    process.exit(1);
});
