import { defaultWizard } from '../../../apps/api/resources/js/features/wizard/data/default-wizard.ts';
import { resolveWizardState } from '../../config-schema/src/index.ts';
import { mapAnswersToPlanInput, generatePlans } from '../src/index.ts';

function buildDefaultAnswers() {
    const rawDefaults = {};
    for (const step of defaultWizard.steps) {
        for (const section of step.sections) {
            for (const field of section.fields) {
                if (field.defaultValue !== undefined) {
                    rawDefaults[field.key] = field.defaultValue;
                }
            }
        }
    }
    const resolved = resolveWizardState(defaultWizard, rawDefaults);
    return { ...resolved.answers };
}

function renderAsciiFloor(fl, levelName) {
    const W = fl.gridD
        ? Math.max(...fl.rooms.map((r) => Math.round(r.polygon[2].x / 910)))
        : 8;
    const D = fl.gridD || 10;
    const grid = Array.from({ length: D }, () =>
        Array.from({ length: W }, () => '    '),
    );

    for (const r of fl.rooms) {
        const x0 = Math.max(0, Math.round(r.polygon[0].x / 910));
        const y0 = Math.max(0, Math.round(r.polygon[0].y / 910));
        const x1 = Math.min(W, Math.round(r.polygon[2].x / 910));
        const y1 = Math.min(D, Math.round(r.polygon[2].y / 910));

        const shortName =
            r.name.length > 3 ? r.name.slice(0, 3) : r.name.padEnd(3, ' ');
        const midY = Math.floor((y0 + y1 - 1) / 2);
        const midX = Math.floor((x0 + x1 - 1) / 2);

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                if (y === midY && x === midX) {
                    grid[y][x] = `[${shortName}]`.slice(0, 4).padEnd(4, ' ');
                } else if (grid[y][x] === '    ') {
                    grid[y][x] = ' .. ';
                }
            }
        }
    }

    const border = '+' + '----'.repeat(W) + '+';
    console.log(
        `\n  --- ${levelName} (${W}x${D} モジュール, ${(W * 0.91).toFixed(1)}m x ${(D * 0.91).toFixed(1)}m) ---`,
    );
    console.log(`  ${border}`);
    for (let y = 0; y < D; y++) {
        console.log(`  |${grid[y].join('')}|`);
    }
    console.log(`  ${border}`);
}

const defaults = buildDefaultAnswers();

const testCases = [
    {
        name: 'Case 1: 1-storey narrow lot (平屋・間口8m狭小地)',
        answers: {
            ...defaults,
            floors: 'one_story',
            plan_type: 'one_story',
            frontage: 8,
            depth: 16,
            land_area: 38.8,
            road_side: 'south',
            plan_target_area: 24,
            plan_ldk_size: 'size_16',
            plan_master_bedroom_size: 'size_6',
            plan_kids_room_count: 'count_1',
            plan_kids_room_size: 'size_5',
            plan_toilet: 'one_floor',
            plan_parking_count: 'cars_1',
            plan_storage: ['walkin_closet', 'pantry'],
        },
    },
    {
        name: 'Case 2: 2-storey large lot with tatami (2階建て・広大地・和室6帖・充実収納)',
        answers: {
            ...defaults,
            floors: 'two_story',
            plan_type: 'two_story',
            frontage: 16,
            depth: 18,
            land_area: 87,
            road_side: 'south',
            plan_target_area: 38,
            plan_ldk_size: 'size_20',
            plan_master_bedroom_size: 'size_8',
            plan_kids_room_count: 'count_2',
            plan_kids_room_size: 'size_6',
            plan_tatami_count: 'count_1',
            plan_tatami_size: 'size_6',
            life_spaces: ['workspace', 'tatami', 'deck_garden', 'fukinuke'],
            plan_parking_count: 'cars_2',
            plan_storage: [
                'walkin_closet',
                'pantry',
                'shoes_cloak',
                'under_stairs',
            ],
        },
    },
    {
        name: 'Case 3: 2 parking standard family (2階建て・駐車場2台・標準ファミリー34坪)',
        answers: {
            ...defaults,
            floors: 'two_story',
            plan_type: 'two_story',
            frontage: 10,
            depth: 14,
            land_area: 50,
            road_side: 'south',
            plan_target_area: 34,
            plan_ldk_size: 'size_18',
            plan_master_bedroom_size: 'size_8',
            plan_kids_room_count: 'count_2',
            plan_kids_room_size: 'size_6',
            plan_parking_count: 'cars_2',
            plan_parking_options: ['carport'],
            life_parking: ['cars_2'],
            plan_storage: ['walkin_closet', 'pantry', 'under_stairs'],
        },
    },
];

console.log('================================================================');
console.log('      AI HOME PLATFORM — ANSWERS -> PLANNER DEMO (T3.8)         ');
console.log(
    '================================================================\n',
);

for (const tc of testCases) {
    console.log(
        `\n################################################################`,
    );
    console.log(`### ${tc.name}`);
    console.log(
        `################################################################`,
    );

    const { input, issues } = mapAnswersToPlanInput(tc.answers);
    console.log('\n>> Mapped PlanInput Summary:');
    console.log(
        `   Floors: ${input.floors}階建て | Target Area: ${input.targetArea}坪 | LDK: ${input.ldkSize}帖 | Master: ${input.masterSize}帖 | Kids: ${input.kidsRooms}室 (${input.kidsSize}帖)`,
    );
    console.log(
        `   Site: 間口 ${input.frontage}m x 奥行 ${input.landDepth}m (${input.landAreaTsubo}坪, 道路: ${input.roadSide})`,
    );
    console.log(
        `   Tatami: ${input.tatamiRoom} | Parking: ${input.cars}台 (${input.parkingType}) | Toilets: ${input.toilets}箇所`,
    );
    console.log(
        `   Amenities: WFH=${input.wfh}, StorageLevel=${input.storageLevel}, Kitchen=${input.kitchenType}`,
    );

    if (issues.length > 0) {
        console.log(`   Mapping Issues/Notes (${issues.length}):`);
        for (const iss of issues) {
            console.log(
                `     - [${iss.code}] ${iss.path.join('.') || 'root'}: ${iss.message}`,
            );
        }
    }

    const result = generatePlans(input);
    console.log(
        `\n>> Generated ${result.plans.length} architectural proposals:`,
    );

    for (let i = 0; i < result.plans.length; i++) {
        const plan = result.plans[i];
        const label = [
            'A (Standard / Balance)',
            'B (Spacious / Storage)',
            'C (Compact / Cost)',
        ][i];
        console.log(
            `\n------------------------------------------------------------`,
        );
        console.log(`>> Variant ${label}`);
        console.log(
            `------------------------------------------------------------`,
        );
        console.log(
            `  延床面積: ${plan.summary.floorAreaM2} m² (${plan.summary.tsubo} 坪) [目標: ${input.targetArea} 坪]`,
        );
        console.log(
            `  建ぺい率: ${plan.summary.coveragePercent}% / 容積率: ${plan.summary.floorRatioPercent}%`,
        );
        console.log(
            `  スコア: 家事動線 ${plan.score.housework}点 | 収納 ${plan.score.storage}点 | 採光 ${plan.score.daylight}点 | コスト ${plan.score.budget}点 | 総合 ${plan.score.total}点`,
        );
        console.log(
            `  部屋数: ${plan.summary.roomsList.length}部屋 (${plan.summary.roomsList.join(', ')})`,
        );

        if (plan.warnings.length > 0) {
            console.log(
                `  個別警告: ${plan.warnings.map((w) => `[${w.code}] ${w.message}`).join('; ')}`,
            );
        }

        for (const fl of plan.model.floors) {
            renderAsciiFloor(fl, `${fl.level}階 Floor Plan`);
        }
    }
}

console.log('\nDemo completed successfully.');
