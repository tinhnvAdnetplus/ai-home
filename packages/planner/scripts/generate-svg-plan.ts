import { generatePlansSafe } from '../src/index.js';
import { DEFAULT_ANSWERS } from './sweep-generator.js';
import { shoelaceAreaM2, JO_M2, TSUBO_M2 } from './oracle-metrics.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

function renderPlanToSvg(): void {
    const res = generatePlansSafe(DEFAULT_ANSWERS);
    if (!res.ok) throw new Error('Generation failed');
    const planA = res.data.plans[0];
    if (!planA) throw new Error('Plan A not found');

    const m = planA.model;
    const colorMap: Record<string, string> = {
        ldk: '#fef3c7',
        bedroom: '#e0e7ff',
        childRoom: '#e0f2fe',
        washitsu: '#ecfccb',
        bath: '#cffafe',
        wash: '#dcfce7',
        toilet: '#f1f5f9',
        laundry: '#ccfbf1',
        entrance: '#ffedd5',
        hall: '#f8fafc',
        corridor: '#f8fafc',
        stairs: '#fed7aa',
        closet: '#f5f5f4',
        storage: '#f5f5f4',
        pantry: '#fef08a',
        void: '#e2e8f0',
    };

    const strokeColor = '#334155';
    const scale = 0.08; // 1mm -> 0.08px (910mm -> 72.8px)
    const padding = 50;

    let totalSvg = '';
    const svgWidth = 1400;
    const svgHeight = 900;

    totalSvg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth.toString()} ${svgHeight.toString()}" width="${svgWidth.toString()}" height="${svgHeight.toString()}" style="background:#ffffff; font-family:sans-serif;">\n`;
    totalSvg += `<style>
        .title { font-size: 20px; font-weight: bold; fill: #0f172a; }
        .subtitle { font-size: 14px; fill: #475569; }
        .room-label { font-size: 13px; font-weight: bold; fill: #1e293b; text-anchor: middle; }
        .room-area { font-size: 11px; fill: #64748b; text-anchor: middle; }
        .floor-title { font-size: 18px; font-weight: bold; fill: #2563eb; }
        .dim-line { stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 4; }
    </style>\n`;

    const totalM2 = m.floors
        .flatMap((f) => f.rooms)
        .filter((r) => r.type !== 'void' && r.type !== 'balcony')
        .reduce((s, r) => s + shoelaceAreaM2(r.polygon), 0);
    const totalTsu = totalM2 / TSUBO_M2;

    totalSvg += `<text x="50" y="45" class="title">AI HOME - Default Plan A (3LDK + 和室)</text>\n`;
    totalSvg += `<text x="50" y="70" class="subtitle">延床面積: ${totalTsu.toFixed(1)} 坪 (${totalM2.toFixed(1)} m²) | 1階: LDK 18.4帖 + 和室 3.1帖 | 2階: 主寝室 8.2帖 + 子ども部屋 5.1帖×2</text>\n`;

    // Render 1F and 2F side by side
    m.floors.forEach((fl, fIdx) => {
        const offsetX = padding + fIdx * 640;
        const offsetY = 140;

        totalSvg += `<g transform="translate(${offsetX.toString()}, ${offsetY.toString()})">\n`;
        totalSvg += `<text x="250" y="-20" class="floor-title" text-anchor="middle">${fl.level.toString()}F FLOOR PLAN</text>\n`;

        // Render rooms
        for (const r of fl.rooms) {
            const fill = colorMap[r.type] ?? '#f8fafc';
            const polyPoints = r.polygon
                .map(
                    (pt) =>
                        `${(pt.x * scale).toFixed(1)},${(pt.y * scale).toFixed(1)}`,
                )
                .join(' ');
            totalSvg += `  <polygon points="${polyPoints}" fill="${fill}" stroke="${strokeColor}" stroke-width="2" />\n`;

            // Calculate center
            let cx = 0;
            let cy = 0;
            for (const pt of r.polygon) {
                cx += pt.x * scale;
                cy += pt.y * scale;
            }
            cx /= r.polygon.length;
            cy /= r.polygon.length;

            const areaM2 = shoelaceAreaM2(r.polygon);
            const jo = areaM2 / JO_M2;

            if (areaM2 >= 1.5) {
                totalSvg += `  <text x="${cx.toFixed(1)}" y="${(cy - 2).toFixed(1)}" class="room-label">${r.name}</text>\n`;
                totalSvg += `  <text x="${cx.toFixed(1)}" y="${(cy + 13).toFixed(1)}" class="room-area">${jo.toFixed(1)}帖 (${areaM2.toFixed(1)}㎡)</text>\n`;
            } else {
                totalSvg += `  <text x="${cx.toFixed(1)}" y="${(cy + 4).toFixed(1)}" class="room-label" style="font-size:10px;">${r.name}</text>\n`;
            }
        }

        // Render stairs
        for (const st of fl.stairs) {
            const polyPoints = st.polygon
                .map(
                    (pt) =>
                        `${(pt.x * scale).toFixed(1)},${(pt.y * scale).toFixed(1)}`,
                )
                .join(' ');
            totalSvg += `  <polygon points="${polyPoints}" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,3" />\n`;
        }

        totalSvg += `</g>\n`;
    });

    totalSvg += `</svg>\n`;

    const outPath = path.resolve(
        process.cwd(),
        '../../docs/design/current/plan-default-A.svg',
    );
    fs.writeFileSync(outPath, totalSvg, 'utf-8');
    console.log(`SVG successfully generated at ${outPath}`);
}

renderPlanToSvg();
