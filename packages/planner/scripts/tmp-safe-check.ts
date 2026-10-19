import { generatePlansSafe } from '../src/index.ts';
import { TWO_STOREY_STANDARD_INPUT } from '../../../apps/api/resources/js/features/plan/data/sample-inputs.ts';
const res: any = generatePlansSafe(TWO_STOREY_STANDARD_INPUT);
if (!res.ok) { console.log('NOT OK', res.issues); process.exit(0); }
const plan = res.data.plans[0];
const f = plan.model.floors[0];
const st = f.rooms.find((r: any) => r.type === 'stairs');
console.log('stairs bbox', JSON.stringify(st.polygon.map((q: any) => [q.x/910, q.y/910])));
for (const w of f.walls.filter((w: any) => w.kind === 'interior')) {
  console.log('wall', [w.a.x, w.a.y, w.b.x, w.b.y].map((v: number) => v/910).join(','));
}
console.log('input echo frontage/depth/area', TWO_STOREY_STANDARD_INPUT.frontage, TWO_STOREY_STANDARD_INPUT.landDepth, TWO_STOREY_STANDARD_INPUT.targetArea);
