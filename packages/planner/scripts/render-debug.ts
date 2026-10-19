import fs from 'node:fs';
import path from 'node:path';
import { generatePlansSafe } from '../src/index.js';
import { DEFAULT_ANSWERS } from './sweep-generator.js';
import { renderFloorSvg } from './render-svg.js';

const CASES = [
    {
        id: 'case1_default_2F_30tsubo',
        title: '標準2階建て 30〜35坪',
        answers: { ...DEFAULT_ANSWERS },
    },
    {
        id: 'case2_1F_25tsubo',
        title: '平屋 25〜30坪',
        answers: {
            ...DEFAULT_ANSWERS,
            plan_type: 'one_story',
            target_area_range: 'area_25_30',
        },
    },
    {
        id: 'case3_2F_40tsubo',
        title: '大型2階建て 40坪以上',
        answers: {
            ...DEFAULT_ANSWERS,
            plan_type: 'two_story',
            target_area_range: 'area_over_40',
        },
    },
    {
        id: 'case4_narrow_7x14',
        title: '狭小間口7m×奥行14m',
        answers: { ...DEFAULT_ANSWERS, frontage: 7, depth: 14, land_area: 30 },
    },
];

const OUT_DIR = path.resolve(process.cwd(), '../../docs/design/current/plans');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function generateHtml(
    caseTitle: string,
    variantName: string,
    tsubo: number,
    svgs: string[],
): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${caseTitle} - ${variantName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif; background: #eceff1; margin: 0; padding: 24px; color: #263238; }
  .card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-width: 1350px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #cfd8dc; padding-bottom: 12px; margin-bottom: 20px; }
  h1 { margin: 0; font-size: 24px; color: #1a237e; }
  .badge { background: #e8eaf6; color: #283593; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 15px; }
  .floors { display: flex; gap: 24px; justify-content: flex-start; align-items: flex-start; overflow-x: auto; }
  .legend { margin-top: 16px; display: flex; gap: 16px; font-size: 12px; color: #546e7a; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .color-box { width: 14px; height: 14px; border-radius: 3px; border: 1px solid #b0bec5; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <h1>${caseTitle}</h1>
      <div style="font-size:16px; color:#455a64; margin-top:4px;">${variantName}</div>
    </div>
    <div class="badge">延床面積: ${tsubo.toFixed(1)} 坪</div>
  </div>
  <div class="floors">
    ${svgs.map((s) => `<div>${s}</div>`).join('')}
  </div>
  <div class="legend">
    <div class="legend-item"><div class="color-box" style="background:#fff9c4"></div>LDK</div>
    <div class="legend-item"><div class="color-box" style="background:#fbe9e7"></div>主寝室</div>
    <div class="legend-item"><div class="color-box" style="background:#e8f5e9"></div>子ども部屋</div>
    <div class="legend-item"><div class="color-box" style="background:#b3e5fc"></div>浴室</div>
    <div class="legend-item"><div class="color-box" style="background:#e1bee7"></div>洗面・脱衣</div>
    <div class="legend-item"><div class="color-box" style="background:#d1c4e9"></div>トイレ</div>
    <div class="legend-item"><div class="color-box" style="background:#d7ccc8"></div>収納 / WIC</div>
    <div class="legend-item"><div class="color-box" style="background:#e0f2f1; border-color:#00796b;"></div>設備・家具</div>
  </div>
</div>
</body>
</html>`;
}

function run(): void {
    const letters = ['A', 'B', 'C'];
    for (const c of CASES) {
        const res = generatePlansSafe(c.answers);
        if (!res.ok) {
            console.error(`Failed to generate plans for ${c.id}`);
            continue;
        }

        for (const [idx, plan] of res.data.plans.entries()) {
            const letter = letters[idx] ?? 'A';
            const svgs = plan.model.floors.map((fl) =>
                renderFloorSvg(fl, 0.05, 30),
            );
            const html = generateHtml(
                c.title,
                plan.label,
                plan.summary.tsubo,
                svgs,
            );
            const htmlPath = path.join(OUT_DIR, `${c.id}_${letter}.html`);
            fs.writeFileSync(htmlPath, html, 'utf-8');
            console.log(`Generated HTML: ${htmlPath}`);
        }
    }
}

run();
