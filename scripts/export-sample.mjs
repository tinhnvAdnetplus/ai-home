import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { generatePlans } from '../packages/planner/src/index.ts';
import {
    exportDxf,
    dxfFileName,
    validateDxfStructure,
} from '../packages/cad-export/src/index.ts';

const SAMPLE_DIR = '/tmp/dxf-samples';
mkdirSync(SAMPLE_DIR, { recursive: true });

const INPUTS = [
    {
        name: 'Standard 2-Story (南道路, 32坪)',
        input: {
            frontage: 10,
            landDepth: 14,
            landAreaTsubo: 42,
            roadSide: '南',
            targetArea: 32,
            floors: 2,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 2,
            kidsSize: 6,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            washCount: 1,
            cars: 1,
        },
    },
    {
        name: 'Narrow Frontage (北道路, 28坪)',
        input: {
            frontage: 7.5,
            landDepth: 16,
            landAreaTsubo: 36,
            roadSide: '北',
            targetArea: 28,
            floors: 2,
            ldkSize: 16,
            masterSize: 7,
            kidsRooms: 1,
            kidsSize: 5,
            toilets: 2,
            bathSize: '1坪',
            bathFloor: '1階',
            washCount: 1,
            cars: 1,
        },
    },
    {
        name: 'Bungalow / 平屋 (東道路, 24坪)',
        input: {
            frontage: 12,
            landDepth: 12,
            landAreaTsubo: 44,
            roadSide: '東',
            targetArea: 24,
            floors: 1,
            ldkSize: 18,
            masterSize: 8,
            kidsRooms: 1,
            kidsSize: 5,
            toilets: 1,
            bathSize: '1坪',
            bathFloor: '1階',
            washCount: 1,
            cars: 2,
        },
    },
];

function independentParseDxf(text) {
    const lines = text.split(/\r?\n/);
    const sections = [];
    let currentSection = null;
    const handles = new Set();
    const entities = [];
    let currentEntity = null;
    const errors = [];

    for (let i = 0; i < lines.length - 1; i += 2) {
        const rawCode = lines[i]?.trim();
        const rawVal = lines[i + 1]?.trim();
        if (!rawCode && !rawVal) continue;
        const code = Number(rawCode);
        if (Number.isNaN(code)) {
            errors.push(`Invalid code line ${i + 1}: ${rawCode}`);
            continue;
        }
        if (rawVal.includes('NaN') || rawVal.includes('undefined')) {
            errors.push(`NaN/undefined at line ${i + 2}: ${rawVal}`);
        }

        if (code === 0) {
            if (rawVal === 'SECTION') {
                currentSection = { name: null };
            } else if (rawVal === 'ENDSEC') {
                if (currentSection) {
                    sections.push(currentSection.name);
                    currentSection = null;
                }
            } else if (currentSection && currentSection.name === 'ENTITIES') {
                if (currentEntity) {
                    entities.push(currentEntity);
                }
                currentEntity = { type: rawVal, layer: '0', handle: null };
            }
        } else if (code === 2 && currentSection && currentSection.name === null) {
            currentSection.name = rawVal;
        } else if (code === 5) {
            const h = rawVal.toUpperCase();
            if (handles.has(h)) {
                errors.push(`Duplicate handle: ${h}`);
            }
            handles.add(h);
            if (currentEntity) {
                currentEntity.handle = h;
            }
        } else if (code === 8 && currentEntity) {
            currentEntity.layer = rawVal;
        }
    }
    if (currentEntity) {
        entities.push(currentEntity);
    }

    const layerCounts = {};
    const typeCounts = {};
    for (const ent of entities) {
        layerCounts[ent.layer] = (layerCounts[ent.layer] || 0) + 1;
        typeCounts[ent.type] = (typeCounts[ent.type] || 0) + 1;
    }

    return {
        sections,
        totalEntities: entities.length,
        totalHandles: handles.size,
        layerCounts,
        typeCounts,
        errors,
    };
}

console.log('====================================================');
console.log('TASK T3.9 — DXF Export Verification for 3 Inputs');
console.log('====================================================\n');

let allPassed = true;

for (let idx = 0; idx < INPUTS.length; idx += 1) {
    const item = INPUTS[idx];
    console.log(`--- [Input ${idx + 1}/3] ${item.name} ---`);
    const planResult = generatePlans(item.input, { seed: 1000 + idx });
    const model = planResult.plans[0].model;

    // 1. Export AutoCAD 2000 DXF
    const dxf2000 = exportDxf(model, { dxfVersion: '2000', textEncoding: 'ascii' });
    const name2000 = `sample-${idx + 1}-2000.dxf`;
    const path2000 = `${SAMPLE_DIR}/${name2000}`;
    writeFileSync(path2000, dxf2000, 'utf8');
    const size2000 = statSync(path2000).size;

    // Validate using validateDxfStructure
    const valResult2000 = validateDxfStructure(dxf2000);
    const parsed2000 = independentParseDxf(dxf2000);

    const is2000Ok = valResult2000.isValid && parsed2000.errors.length === 0;
    if (!is2000Ok) allPassed = false;

    console.log(`File: ${path2000} (${(size2000 / 1024).toFixed(1)} KB, ${size2000} bytes)`);
    console.log(`Format: AutoCAD 2000 (AC1015) | Valid: ${is2000Ok ? 'PASS' : 'FAIL'}`);
    console.log(`Sections: ${parsed2000.sections.join(' -> ')}`);
    console.log(`Total Entities: ${parsed2000.totalEntities} | Unique Handles: ${parsed2000.totalHandles}`);
    console.log('Entity counts per layer:');
    for (const [layer, count] of Object.entries(parsed2000.layerCounts)) {
        console.log(`  - ${layer.padEnd(16)}: ${count}`);
    }
    console.log('Entity counts per type:');
    for (const [type, count] of Object.entries(parsed2000.typeCounts)) {
        console.log(`  - ${type.padEnd(16)}: ${count}`);
    }

    // 2. Export R12 DXF
    const dxfR12 = exportDxf(model, { dxfVersion: 'R12', textEncoding: 'ascii' });
    const nameR12 = `sample-${idx + 1}-r12.dxf`;
    const pathR12 = `${SAMPLE_DIR}/${nameR12}`;
    writeFileSync(pathR12, dxfR12, 'utf8');
    const sizeR12 = statSync(pathR12).size;
    const valResultR12 = validateDxfStructure(dxfR12);
    const isR12Ok = valResultR12.isValid;
    if (!isR12Ok) allPassed = false;
    console.log(`R12 File: ${pathR12} (${(sizeR12 / 1024).toFixed(1)} KB) | Valid: ${isR12Ok ? 'PASS' : 'FAIL'}`);

    // 3. Test dxfFileName helper
    const autoFileName = dxfFileName(model, { prefix: 'house' });
    const floor1FileName = dxfFileName(model, { prefix: 'house', floorLevel: 1 });
    console.log(`Generated filename (all): ${autoFileName}`);
    console.log(`Generated filename (1F) : ${floor1FileName}\n`);
}

console.log('====================================================');
if (allPassed) {
    console.log('ALL 3 SAMPLES SUCCESSFULLY GENERATED AND VERIFIED!');
} else {
    console.log('VERIFICATION ENCOUNTERED FAILURES!');
    process.exit(1);
}
console.log('====================================================');
