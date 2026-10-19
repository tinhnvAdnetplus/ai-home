import { generatePlans, normalizePlanInput } from '../src/index.ts';
import { exportDxf, validateDxfStructure } from '../../cad-export/src/index.ts';

const inputs = [{}, { floors: 1 }, { floors: 2, landArea: 80 }];
for (const raw of inputs) {
    const res = generatePlans(normalizePlanInput(raw));
    for (const plan of res.plans) {
        const dxf = exportDxf(plan.model);
        const v = validateDxfStructure(dxf);
        const layers = new Set(
            dxf.split('\n').filter((_, i, a) => a[i - 1]?.trim() === '8'),
        );
        console.log(
            JSON.stringify(raw),
            plan.id,
            'bytes',
            dxf.length,
            'ok',
            JSON.stringify(v).slice(0, 80),
            'layers',
            layers.size,
            'NaN',
            dxf.includes('NaN'),
        );
    }
}
