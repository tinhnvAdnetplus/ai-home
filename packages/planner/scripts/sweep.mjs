import { generatePlansSafe } from '../src/index.ts';
import { parseBuildingModel } from '@aihome/bdm';

// Deterministic LCG pseudo-random generator for input generation
function makePrng(seed) {
    let s = seed >>> 0;
    return function next() {
        s = (Math.imul(1664525, s) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

const rand = makePrng(12345);

function pick(arr) {
    return arr[Math.floor(rand() * arr.length)];
}

function randRange(min, max) {
    return min + rand() * (max - min);
}

function randInt(min, max) {
    return Math.floor(randRange(min, max + 1));
}

console.log('================================================================');
console.log('       SWEEP TEST: 200 PSEUDO-RANDOM INPUTS -> BDM VALIDATION   ');
console.log(
    '================================================================\n',
);

const TOTAL_INPUTS = 200;
let totalPlansGenerated = 0;
let totalBdmValid = 0;
let totalBdmInvalid = 0;
const warningCounts = new Map();
const startTime = performance.now();

for (let i = 0; i < TOTAL_INPUTS; i++) {
    const floors = rand() < 0.25 ? 1 : 2;
    const frontage = Math.round(randRange(6, 22) * 10) / 10;
    const landDepth = Math.round(randRange(8, 25) * 10) / 10;
    const landTsubo = Math.round(randRange(25, 120));
    const targetArea = Math.round(randRange(22, 55));
    const ldkSize = randInt(12, 24);
    const masterSize = randInt(6, 10);
    const kidsRooms = randInt(0, 4);
    const kidsSize = randInt(4, 7);
    const toilets = randInt(1, 3);
    const roadSide = pick(['北', '東', '南', '西']);
    const bathSize = pick(['1坪', '1.25坪', '1.5坪']);
    const bathFloor = floors === 1 ? '1階' : pick(['1階', '2階']);
    const tatamiRoom = pick(['なし', 'リビング続き4.5帖', 'なし', 'なし']);
    const storageLevel = pick(['最小限', '標準', '大容量希望']);
    const cars = randInt(0, 3);

    const mustPool = [
        'パントリー',
        'ランドリールーム',
        'ファミリークローゼット',
        'ウッドデッキ',
        '書斎',
    ];
    const notPool = ['和室', 'バルコニー', '客間'];
    const mustHave = rand() < 0.4 ? [pick(mustPool)] : [];
    const notNeeded = rand() < 0.2 ? [pick(notPool)] : [];

    const rawInput = {
        frontage,
        landDepth,
        landAreaTsubo: landTsubo,
        targetArea,
        floors,
        ldkSize,
        masterSize,
        kidsRooms,
        kidsSize,
        toilets,
        roadSide,
        bathSize,
        bathFloor,
        tatamiRoom,
        storageLevel,
        cars,
        mustHave,
        notNeeded,
    };

    const res = generatePlansSafe(rawInput, {}, i * 3);
    if (!res.ok) {
        console.error(`Generation failed at input #${i}:`, res.issues);
        continue;
    }

    const { plans, warnings } = res.data;
    for (const w of warnings) {
        warningCounts.set(w.code, (warningCounts.get(w.code) || 0) + 1);
    }

    for (const plan of plans) {
        totalPlansGenerated++;
        for (const w of plan.warnings) {
            warningCounts.set(w.code, (warningCounts.get(w.code) || 0) + 1);
        }

        const bdmRes = parseBuildingModel(plan.model);
        if (bdmRes.ok) {
            totalBdmValid++;
        } else {
            totalBdmInvalid++;
            console.error(
                `BDM invalid in input #${i} plan ${plan.id}:`,
                bdmRes.issues,
            );
        }
    }

    if ((i + 1) % 50 === 0) {
        console.log(
            `Processed ${i + 1}/${TOTAL_INPUTS} inputs (${totalPlansGenerated} plans generated)...`,
        );
    }
}

const elapsedMs = performance.now() - startTime;
const avgPerInputMs = elapsedMs / TOTAL_INPUTS;
const avgPerPlanMs = elapsedMs / totalPlansGenerated;

console.log(
    '\n================================================================',
);
console.log('                      SWEEP SUMMARY RESULTS                     ');
console.log('================================================================');
console.log(`Inputs processed:          ${TOTAL_INPUTS}`);
console.log(`Total plans evaluated:     ${totalPlansGenerated}`);
console.log(
    `BDM Valid models:          ${totalBdmValid} / ${totalPlansGenerated} (${((totalBdmValid / totalPlansGenerated) * 100).toFixed(1)}%)`,
);
console.log(`BDM Invalid models:        ${totalBdmInvalid}`);
console.log(`Total elapsed time:        ${elapsedMs.toFixed(1)} ms`);
console.log(`Avg time per 3-plan batch: ${avgPerInputMs.toFixed(2)} ms`);
console.log(`Avg time per plan:         ${avgPerPlanMs.toFixed(2)} ms`);

console.log('\nWarning distribution:');
const sortedWarnings = Array.from(warningCounts.entries()).sort(
    (a, b) => b[1] - a[1],
);
for (const [code, count] of sortedWarnings) {
    console.log(`  - [${code}]: ${count} occurrences`);
}

if (totalBdmInvalid > 0 || totalBdmValid !== totalPlansGenerated) {
    console.error(
        '\nFAILURE: Some generated building models failed BDM validation!',
    );
    process.exit(1);
} else {
    console.log(
        '\nSUCCESS: 100% of generated models passed BDM validation (ok: true).',
    );
}
