import { generatePlansSafe, normalizePlanInput } from '../src/index.ts';
import { parseBuildingModel } from '@aihome/bdm';

const sampleInputs = [
    {
        name: 'Sample 1: 平屋 (1-storey compact)',
        input: {
            floors: 1,
            frontage: 14,
            landDepth: 16,
            landTsubo: 60,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 1,
            kidsSize: 6,
            targetArea: 28,
            toilets: 1,
            bathSize: '1坪',
            bathFloor: '1階',
            roadSide: '南',
            cars: 1,
        },
    },
    {
        name: 'Sample 2: 2階建て標準 (2-storey family)',
        input: {
            floors: 2,
            frontage: 10,
            landDepth: 14,
            landTsubo: 50,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 2,
            kidsSize: 6,
            targetArea: 35,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            roadSide: '南',
            waterOpts: ['ランドリールーム', 'パントリー'],
            cars: 2,
        },
    },
    {
        name: 'Sample 3: 狭小地 (Narrow lot 7m frontage)',
        input: {
            floors: 2,
            frontage: 7,
            landDepth: 16,
            landTsubo: 35,
            ldkSize: 16,
            masterSize: 6,
            kidsRooms: 2,
            kidsSize: 5,
            targetArea: 30,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            roadSide: '南',
            cars: 1,
        },
    },
];

function renderAsciiFloor(floor, levelName) {
    const W = Math.round((floor.walls[0]?.b.x || 0) / 910);
    const D = Math.round((floor.walls[1]?.b.y || 0) / 910);

    const grid = Array.from({ length: D }, () =>
        Array.from({ length: W }, () => '    '),
    );

    // Sort rooms so smaller or specific rooms overlay broad ones if needed
    for (const r of floor.rooms) {
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

console.log('================================================================');
console.log('            AI HOME PLATFORM — FLOOR PLAN DEMO                  ');
console.log(
    '================================================================\n',
);

for (const sample of sampleInputs) {
    console.log(
        `\n################################################################`,
    );
    console.log(`### ${sample.name}`);
    console.log(
        `################################################################`,
    );

    const normalized = normalizePlanInput(sample.input);
    const result = generatePlansSafe(normalized, {}, 42);

    if (!result.ok) {
        console.error('Plan generation failed:', result.issues);
        continue;
    }

    const { plans, warnings } = result.data;
    console.log(`\nProposals Generated: ${plans.length}`);
    if (warnings.length > 0) {
        console.log(
            `Global Warnings: ${warnings.map((w) => w.message).join(', ')}`,
        );
    }

    for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        const letter = [
            'A (Standard/Balance)',
            'B (Spacious/Storage)',
            'C (Compact/Cost)',
        ][i];
        console.log(
            `\n------------------------------------------------------------`,
        );
        console.log(`>> Variant ${letter}`);
        console.log(
            `------------------------------------------------------------`,
        );
        console.log(
            `  面積: ${plan.summary.floorAreaM2} m² (${plan.summary.tsubo} 坪) [目標: ${normalized.targetArea} 坪]`,
        );
        console.log(
            `  建ぺい率: ${plan.summary.coveragePercent}% / 容積率: ${plan.summary.floorRatioPercent}%`,
        );
        console.log(
            `  スコア: 家事動線 ${plan.score.housework}点 | 収納 ${plan.score.storage}点 | 採光 ${plan.score.daylight}点 | コスト ${plan.score.budget}点 | 総合 ${plan.score.total}点`,
        );
        console.log(
            `  概算建築費: 約 ${(plan.summary.floorAreaM2 * 22).toFixed(0)} 万円`,
        );

        const bdmValidation = parseBuildingModel(plan.model);
        console.log(
            `  BDM Validation: ${bdmValidation.ok ? 'VALID (ok: true)' : 'INVALID issues: ' + JSON.stringify(bdmValidation.issues)}`,
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
