import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { generatePlans, normalizePlanInput } from '../src/index.ts';

const localOldPlanner = path.resolve(import.meta.dirname, './old-planner.cjs');
const fallbackOldPlanner = path.resolve(
    import.meta.dirname,
    '../../../../old-version/js/planner.js',
);
const oldPlannerPath = fs.existsSync(localOldPlanner)
    ? localOldPlanner
    : fallbackOldPlanner;
const oldPlannerCode = fs.readFileSync(oldPlannerPath, 'utf8');

const sandbox = {
    window: {},
    console,
    Math,
    Array,
    Object,
    Number,
    String,
};
sandbox.global = sandbox.window;
sandbox.window.AIH = {
    U: {
        clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
    },
};
vm.createContext(sandbox);
vm.runInContext(oldPlannerCode, sandbox);
const oldPlanner = sandbox.window.AIH_PLANNER;

const testCases = [
    {
        name: 'Case 1: 1-storey (平屋)',
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
        name: 'Case 2: 2-storey standard',
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
            cars: 2,
        },
    },
    {
        name: 'Case 3: Narrow lot (7m frontage)',
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
    {
        name: 'Case 4: Large lot (18m frontage)',
        input: {
            floors: 2,
            frontage: 18,
            landDepth: 20,
            landTsubo: 90,
            ldkSize: 22,
            masterSize: 10,
            kidsRooms: 3,
            kidsSize: 6,
            targetArea: 50,
            toilets: 2,
            bathSize: '1.25坪',
            bathFloor: '1階',
            roadSide: '南',
            cars: 3,
        },
    },
    {
        name: 'Case 5: With Tatami room (和室)',
        input: {
            floors: 2,
            frontage: 12,
            landDepth: 14,
            landTsubo: 55,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 2,
            kidsSize: 6,
            targetArea: 38,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            roadSide: '南',
            tatamiRoom: 'リビング続き4.5帖',
            cars: 2,
        },
    },
    {
        name: 'Case 6: Without Tatami, 2 parking, laundry',
        input: {
            floors: 2,
            frontage: 11,
            landDepth: 15,
            landTsubo: 52,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 2,
            kidsSize: 6,
            targetArea: 36,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            roadSide: '南',
            tatamiRoom: 'なし',
            waterOpts: ['ランドリールーム', 'パントリー'],
            cars: 2,
        },
    },
];

console.log('=== COMPARISON WITH OLD PLANNER PROTOTYPE ===\n');

let totalChecks = 0;
let matchChecks = 0;

for (const tc of testCases) {
    console.log(`----------------------------------------`);
    console.log(`Test: ${tc.name}`);
    console.log(`----------------------------------------`);

    // Old planner expects effectiveValues-like input
    const normalizedInput = normalizePlanInput(tc.input);
    const oldV = { ...tc.input };
    if (!oldV.landArea) oldV.landArea = (oldV.landTsubo || 50) * 3.305785;
    if (!oldV.coverage) oldV.coverage = 60;
    if (!oldV.floorRatio) oldV.floorRatio = 200;
    if (!oldV.japaneseRoom) oldV.japaneseRoom = normalizedInput.tatamiRoom;
    if (!oldV.waterOpts)
        oldV.waterOpts = [...(normalizedInput.waterOpts || [])];
    if (!oldV.storageOpts) oldV.storageOpts = ['階段下収納'];
    if (!oldV.extraRooms) oldV.extraRooms = [];
    if (!oldV.shoesCloset) oldV.shoesCloset = '収納型';
    if (!oldV.masterCloset) oldV.masterCloset = 'ウォークイン';
    if (!oldV.kidsCloset) oldV.kidsCloset = 'クローゼット';

    const oldPlans = oldPlanner.generateAll(oldV);

    const newResult = generatePlans(normalizedInput, {}, 42);

    for (let i = 0; i < 3; i++) {
        const op = oldPlans[i];
        const np = newResult.plans[i];
        const variantLetter = ['A', 'B', 'C'][i];

        if (!op || !np) {
            console.log(`Variant ${variantLetter}: MISSING PLAN`);
            continue;
        }

        totalChecks++;
        const oldRooms = op.floors
            .flatMap((f) => f.rooms.map((r) => r.name))
            .sort();
        const newRooms = np.model.floors
            .flatMap((f) => f.rooms.map((r) => r.name))
            .sort();

        const oldArea = Math.round(op.totalM2 * 10) / 10;
        const newArea = Math.round(np.summary.floorAreaM2 * 10) / 10;
        const areaDiff = Math.abs(oldArea - newArea);

        const oldW = op.gridW;
        const newW = np.model.floors[0]
            ? Math.round((np.model.floors[0].walls[0]?.b.x || 0) / 910)
            : 0;
        const oldD1 = op.gridD;
        const newD1 = np.model.floors[0]
            ? Math.round((np.model.floors[0].walls[1]?.b.y || 0) / 910)
            : 0;

        const isGridMatch = oldW === newW && oldD1 === newD1;
        const isAreaMatch = areaDiff <= 1.0; // within 1 cell
        const isRoomsMatch =
            JSON.stringify(oldRooms) === JSON.stringify(newRooms);

        if (isGridMatch && isAreaMatch && isRoomsMatch) {
            matchChecks++;
            console.log(
                `  Variant ${variantLetter}: MATCH [Grid: ${newW}x${newD1}, Area: ${newArea}m² (${np.summary.tsubo}坪), Rooms: ${newRooms.length}]`,
            );
        } else {
            console.log(`  Variant ${variantLetter}: DIFF`);
            console.log(`    Grid: old ${oldW}x${oldD1}, new ${newW}x${newD1}`);
            console.log(
                `    Area: old ${oldArea}m², new ${newArea}m² (diff: ${areaDiff.toFixed(2)}m²)`,
            );
            console.log(`    Rooms match: ${isRoomsMatch ? 'YES' : 'NO'}`);
            if (!isRoomsMatch) {
                console.log(`    Old rooms: ${oldRooms.join(', ')}`);
                console.log(`    New rooms: ${newRooms.join(', ')}`);
            }
        }
    }
    console.log();
}

console.log(
    `SUMMARY: ${matchChecks}/${totalChecks} variant proposals matched.`,
);
