import { generatePlansSafe } from '../src/index.js';
import { DEFAULT_ANSWERS } from './sweep-generator.js';
import {
    evaluatePlanWithOracle,
    shoelaceAreaM2,
    JO_M2,
} from './oracle-metrics.js';

type Case = {
    readonly name: string;
    readonly answers: Record<string, unknown>;
};

function createTestCases(): Case[] {
    const list: Case[] = [
        { name: 'DEFAULT_WIZARD', answers: { ...DEFAULT_ANSWERS } },
    ];

    // Area bands
    const areaBands = [
        'area_under_25',
        'area_25_30',
        'area_30_35',
        'area_35_40',
        'area_over_40',
    ];
    for (const b of areaBands) {
        list.push({
            name: `2F_${b}`,
            answers: {
                ...DEFAULT_ANSWERS,
                target_area_range: b,
                plan_type: 'two_story',
            },
        });
        list.push({
            name: `1F_${b}`,
            answers: {
                ...DEFAULT_ANSWERS,
                target_area_range: b,
                plan_type: 'one_story',
            },
        });
    }

    // LDK sizes
    const ldkSizes = [
        'size_14',
        'size_16',
        'size_18',
        'size_20',
        'size_22',
        'size_24_plus',
    ];
    for (const s of ldkSizes) {
        list.push({
            name: `LDK_${s}`,
            answers: { ...DEFAULT_ANSWERS, plan_ldk_size: s },
        });
    }

    // Kids room counts and sizes
    const kidsCounts = ['count_0', 'count_1', 'count_2', 'count_3'];
    for (const c of kidsCounts) {
        list.push({
            name: `KIDS_${c}`,
            answers: { ...DEFAULT_ANSWERS, plan_kids_room_count: c },
        });
    }
    const kidsSizes = ['size_4_5', 'size_5', 'size_6', 'size_8'];
    for (const ks of kidsSizes) {
        list.push({
            name: `KIDS_${ks}`,
            answers: { ...DEFAULT_ANSWERS, plan_kids_room_size: ks },
        });
    }

    // Master bedroom sizes
    const masterSizes = [
        'size_6',
        'size_7',
        'size_8',
        'size_10',
        'size_12_plus',
    ];
    for (const ms of masterSizes) {
        list.push({
            name: `MASTER_${ms}`,
            answers: { ...DEFAULT_ANSWERS, plan_master_bedroom_size: ms },
        });
    }

    // Site variations (narrow, small, large, wide)
    list.push({
        name: 'SITE_narrow_7x14',
        answers: { ...DEFAULT_ANSWERS, frontage: 7, depth: 14, land_area: 30 },
    });
    list.push({
        name: 'SITE_shallow_12x9',
        answers: { ...DEFAULT_ANSWERS, frontage: 12, depth: 9, land_area: 32 },
    });
    list.push({
        name: 'SITE_small_8x10',
        answers: { ...DEFAULT_ANSWERS, frontage: 8, depth: 10, land_area: 24 },
    });
    list.push({
        name: 'SITE_wide_16x12',
        answers: { ...DEFAULT_ANSWERS, frontage: 16, depth: 12, land_area: 58 },
    });
    list.push({
        name: 'SITE_large_20x20',
        answers: {
            ...DEFAULT_ANSWERS,
            frontage: 20,
            depth: 20,
            land_area: 120,
        },
    });
    list.push({
        name: 'SITE_deep_9x22_land60',
        answers: { ...DEFAULT_ANSWERS, frontage: 9, depth: 22, land_area: 60 },
    });

    // Amenities (tatami, study)
    list.push({
        name: 'TATAMI_yes',
        answers: {
            ...DEFAULT_ANSWERS,
            plan_tatami_count: 'count_1',
            plan_tatami_size: 'size_6',
        },
    });
    list.push({
        name: 'TATAMI_none',
        answers: { ...DEFAULT_ANSWERS, plan_tatami_count: 'count_0' },
    });
    list.push({
        name: 'STUDY_yes',
        answers: {
            ...DEFAULT_ANSWERS,
            life_work: 'dedicated_room',
            plan_study_count: 'count_1',
        },
    });

    return list;
}

function runOracle(): void {
    const cases = createTestCases();
    console.log(
        `Running Independent Oracle on ${cases.length.toString()} cases...`,
    );
    console.log(
        '| Case Name                 | Req Tsu | Act Tsu | Dev %  | Req LDK | Act LDK | Req Mstr| Act Mstr| Req Kid | Act Kid | Hall m2 | St | Pass? |',
    );
    console.log(
        '|---------------------------|---------|---------|--------|---------|---------|---------|---------|---------|---------|---------|----|-------|',
    );

    let totalPass = 0;
    let totalFail = 0;
    const failedCases: string[] = [];

    for (const c of cases) {
        const res = generatePlansSafe(c.answers);
        if (!res.ok) {
            console.log(`| ${c.name.padEnd(25)} | GENERATION FAILED! |`);
            totalFail++;
            continue;
        }

        for (const [pIdx, plan] of res.data.plans.entries()) {
            const pLetter = ['A', 'B', 'C'][pIdx] ?? 'A';
            const fullName = `${c.name}_${pLetter}`;

            if (c.name === 'DEFAULT_WIZARD' && pLetter === 'A') {
                console.log('--- DEFAULT_WIZARD ROOMS DETAIL (Plan A) ---');
                for (const fl of plan.model.floors) {
                    console.log(`Floor ${fl.level.toString()}:`);
                    for (const rm of fl.rooms) {
                        const area = shoelaceAreaM2(rm.polygon);
                        console.log(
                            `  ${rm.name.padEnd(12)} (${rm.type}) : ${area.toFixed(2)} m2 = ${(area / JO_M2).toFixed(1)} jo`,
                        );
                    }
                }
                console.log('--------------------------------------------');
            }

            const { metrics, requested } = evaluatePlanWithOracle(
                c.answers,
                plan,
            );
            const areaDevPct =
                ((metrics.totalFloorAreaTsubo - requested.targetTsubo) /
                    requested.targetTsubo) *
                100;
            const actLdkJo = metrics.roomAreasJo.ldk ?? 0;
            const actMasterJo = metrics.roomAreasJo.bedroom ?? 0;
            const actKidsJo =
                metrics.roomCounts.childRoom && metrics.roomCounts.childRoom > 0
                    ? (metrics.roomAreasJo.childRoom ?? 0) /
                      metrics.roomCounts.childRoom
                    : 0;
            const hallM2 =
                (metrics.roomAreasM2.hall ?? 0) +
                (metrics.roomAreasM2.corridor ?? 0);

            const hasAreaWarning = plan.warnings.some(
                (w) => w.code === 'TOTAL_AREA_DEVIATION',
            );
            const areaPass = Math.abs(areaDevPct) <= 8.0 || hasAreaWarning;
            const hasLdkReduced = plan.warnings.some(
                (w) => w.code === 'ROOM_SIZE_REDUCED:ldk',
            );
            const ldkPass =
                Math.abs(actLdkJo - requested.ldkJo) <= 1.0 || hasLdkReduced;
            const hasMasterReduced = plan.warnings.some(
                (w) => w.code === 'ROOM_SIZE_REDUCED:master',
            );
            const masterPass =
                Math.abs(actMasterJo - requested.masterJo) <= 1.0 ||
                hasMasterReduced;
            const hasKidsReduced = plan.warnings.some(
                (w) => w.code === 'ROOM_SIZE_REDUCED:kids',
            );
            const kidsPass =
                requested.kidsRooms === 0 ||
                Math.abs(actKidsJo - requested.kidsJo) <= 1.0 ||
                hasKidsReduced;
            const isOverallPass = areaPass && ldkPass && masterPass && kidsPass;

            if (isOverallPass) totalPass++;
            else {
                totalFail++;
                failedCases.push(
                    `${fullName} (area:${String(areaPass)} ldk:${String(ldkPass)} mstr:${String(masterPass)} kid:${String(kidsPass)})`,
                );
            }

            const passStr = isOverallPass ? 'PASS' : 'FAIL';
            console.log(
                `| ${fullName.padEnd(25)} | ` +
                    `${requested.targetTsubo.toFixed(1).padStart(7)} | ` +
                    `${metrics.totalFloorAreaTsubo.toFixed(1).padStart(7)} | ` +
                    `${(areaDevPct >= 0 ? '+' : '') + areaDevPct.toFixed(1)}% | ` +
                    `${requested.ldkJo.toFixed(1).padStart(7)} | ` +
                    `${actLdkJo.toFixed(1).padStart(7)} | ` +
                    `${requested.masterJo.toFixed(1).padStart(7)} | ` +
                    `${actMasterJo.toFixed(1).padStart(7)} | ` +
                    `${requested.kidsJo.toFixed(1).padStart(7)} | ` +
                    `${actKidsJo.toFixed(1).padStart(7)} | ` +
                    `${hallM2.toFixed(1).padStart(7)} | ` +
                    `${metrics.storeys.toString().padStart(2)} | ` +
                    `${passStr.padEnd(5)} |`,
            );
        }
    }

    console.log(
        `\nOracle Summary: ${totalPass.toString()} passed, ${totalFail.toString()} failed out of ${cases.length.toString()} cases.`,
    );
    if (failedCases.length > 0) {
        console.log('FAILED CASES:\n', failedCases.join('\n'));
    }
}

runOracle();
