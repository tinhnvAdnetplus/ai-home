import { type Floor } from '@aihome/bdm';

const ROOM_COLORS: Record<string, string> = {
    ldk: '#fff9c4',
    bedroom: '#fbe9e7',
    childRoom: '#e8f5e9',
    washitsu: '#dcedc8',
    bath: '#b3e5fc',
    wash: '#e1bee7',
    laundry: '#ede7f6',
    toilet: '#d1c4e9',
    entrance: '#cfd8dc',
    hall: '#eceff1',
    closet: '#d7ccc8',
    pantry: '#ffe0b2',
    stairs: '#ffe082',
    study: '#c8e6c9',
};

const FIXTURES: Record<string, { w: number; d: number; label: string }> = {
    kitchen_counter: { w: 2550, d: 650, label: 'Kitchen' },
    kitchen_island: { w: 2400, d: 900, label: 'Island Kitchen' },
    kitchen_l: { w: 2200, d: 1800, label: 'L-Kitchen' },
    dining_table_4: { w: 1400, d: 800, label: 'Dining (4P)' },
    dining_table_6: { w: 1800, d: 900, label: 'Dining (6P)' },
    sofa: { w: 2000, d: 900, label: 'Sofa' },
    tv_board: { w: 1600, d: 450, label: 'TV' },
    bathtub: { w: 1600, d: 1600, label: 'Bath 1616' },
    vanity: { w: 900, d: 550, label: '洗面台' },
    washing_machine: { w: 650, d: 650, label: '洗濯機' },
    toilet_bowl: { w: 450, d: 700, label: '便器' },
    bed_double: { w: 1400, d: 2000, label: 'Double Bed' },
    bed_single: { w: 1000, d: 2000, label: 'Single Bed' },
    desk: { w: 1200, d: 600, label: 'Desk' },
};

function ptsToSvg(
    pts: readonly { readonly x: number; readonly y: number }[],
    s: number,
    ox: number,
    oy: number,
): string {
    return pts
        .map(
            (p) =>
                `${((p.x - ox) * s).toFixed(1)},${((p.y - oy) * s).toFixed(1)}`,
        )
        .join(' ');
}

export function renderFloorSvg(floor: Floor, scale = 0.05, pad = 20): string {
    const allPts = floor.rooms.flatMap((r) => r.polygon);
    if (allPts.length === 0) return '<svg></svg>';
    const minX = Math.min(...allPts.map((p) => p.x));
    const minY = Math.min(...allPts.map((p) => p.y));
    const maxX = Math.max(...allPts.map((p) => p.x));
    const maxY = Math.max(...allPts.map((p) => p.y));

    const w = (maxX - minX) * scale + pad * 2;
    const h = (maxY - minY) * scale + pad * 2;
    const ox = minX - pad / scale;
    const oy = minY - pad / scale;

    let svg = `<svg viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" style="background:#fcfbf9;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">`;
    svg +=
        '<defs><pattern id="grid" width="45.5" height="45.5" patternUnits="userSpaceOnUse"><path d="M 45.5 0 L 0 0 0 45.5" fill="none" stroke="#f0ece6" stroke-width="1"/></pattern></defs>';
    svg += `<rect width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="url(#grid)"/>`;

    // Rooms
    for (const r of floor.rooms) {
        const poly = ptsToSvg(r.polygon, scale, ox, oy);
        const col = ROOM_COLORS[r.type] ?? '#ffffff';
        svg += `<polygon points="${poly}" fill="${col}" stroke="#90a4ae" stroke-width="1" opacity="0.85"/>`;

        const xs = r.polygon.map((p) => p.x);
        const ys = r.polygon.map((p) => p.y);
        const rmMinX = Math.min(...xs);
        const rmMaxX = Math.max(...xs);
        const rmMinY = Math.min(...ys);
        const rmMaxY = Math.max(...ys);
        const rmWPx = (rmMaxX - rmMinX) * scale;
        const rmHPx = (rmMaxY - rmMinY) * scale;

        let cx =
            (r.polygon.reduce((a, b) => a + b.x, 0) / r.polygon.length - ox) *
            scale;
        let cy =
            (r.polygon.reduce((a, b) => a + b.y, 0) / r.polygon.length - oy) *
            scale;

        if (r.type === 'childRoom') {
            if (rmWPx >= 120) {
                cx = ((rmMinX + 1300 + rmMaxX) / 2 - ox) * scale;
            } else {
                cy = (rmMaxY - 950 - oy) * scale;
            }
        } else if (r.type === 'bedroom' && r.name === '主寝室') {
            if (rmWPx >= 120) {
                cx = ((rmMinX + 1800 + rmMaxX) / 2 - ox) * scale;
            }
        } else if (r.type === 'toilet') {
            cy = (rmMaxY - 450 - oy) * scale;
        } else if (r.type === 'wash') {
            cy = (rmMaxY - 450 - oy) * scale;
        } else if (r.type === 'ldk') {
            cy = (rmMinY + (rmMaxY - rmMinY) * 0.35 - oy) * scale;
        }

        const isNarrow = rmWPx < 55 || rmHPx < 55;
        const titleFontSize = isNarrow ? (r.name.length >= 4 ? 8 : 9) : 12;
        const joFontSize = isNarrow ? 7.5 : 10;
        const yOffset = isNarrow ? 2 : 4;

        if (r.type !== 'stairs') {
            const jo = (r.areaM2 / 1.62).toFixed(1);
            svg += `<text x="${cx.toFixed(1)}" y="${(cy - yOffset).toFixed(1)}" text-anchor="middle" font-family="'Noto Sans JP', sans-serif" font-size="${titleFontSize.toString()}" font-weight="bold" fill="#37474f">${r.name}</text>`;
            svg += `<text x="${cx.toFixed(1)}" y="${(cy + yOffset + (isNarrow ? 6 : 8)).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="${joFontSize.toString()}" fill="#78909c">${jo}帖</text>`;
        }
    }

    // Fixtures
    for (const f of floor.fixtures) {
        if (!f.pos) continue;
        const fx = (f.pos.x - ox) * scale;
        const fy = (f.pos.y - oy) * scale;
        const info = FIXTURES[f.kind] ?? { w: 800, d: 800, label: f.kind };
        const fw = info.w * scale;
        const fd = info.d * scale;
        const rot = f.rotation ?? 0;
        svg += `<g transform="translate(${fx.toFixed(1)},${fy.toFixed(1)}) rotate(${rot.toString()})">`;
        svg += `<rect x="0" y="0" width="${fw.toFixed(1)}" height="${fd.toFixed(1)}" rx="3" fill="#e0f2f1" stroke="#00796b" stroke-width="1.2"/>`;
        svg += `<text x="${(fw / 2).toFixed(1)}" y="${(fd / 2 + 3).toFixed(1)}" text-anchor="middle" font-family="'Noto Sans JP', sans-serif" font-size="8" fill="#004d40">${info.label}</text></g>`;
    }

    // Stairs
    for (const st of floor.stairs) {
        const poly = ptsToSvg(st.polygon, scale, ox, oy);
        svg += `<polygon points="${poly}" fill="#ffe082" stroke="#e65100" stroke-width="1.5" opacity="0.8"/>`;
        const cx =
            (st.polygon.reduce((a, b) => a + b.x, 0) / st.polygon.length - ox) *
            scale;
        const cy =
            (st.polygon.reduce((a, b) => a + b.y, 0) / st.polygon.length - oy) *
            scale;
        svg += `<text x="${cx.toFixed(1)}" y="${(cy - 3).toFixed(1)}" text-anchor="middle" font-family="'Noto Sans JP', sans-serif" font-size="11" font-weight="bold" fill="#37474f">階段</text>`;
        svg += `<text x="${cx.toFixed(1)}" y="${(cy + 11).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="bold" fill="#bf360c">${st.direction.toUpperCase()} (${st.steps.toString()}段)</text>`;
    }

    // Walls
    for (const wl of floor.walls) {
        if (!wl.a || !wl.b) continue;
        const x1 = (wl.a.x - ox) * scale;
        const y1 = (wl.a.y - oy) * scale;
        const x2 = (wl.b.x - ox) * scale;
        const y2 = (wl.b.y - oy) * scale;
        const strokeW = wl.kind === 'exterior' ? '3.5' : '2';
        const col = wl.kind === 'exterior' ? '#263238' : '#78909c';
        svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    }

    // Openings
    const wallMap = new Map(floor.walls.map((wItem) => [wItem.id, wItem]));
    for (const op of floor.openings) {
        const wl = wallMap.get(op.wallId);
        if (!wl || !wl.a || !wl.b) continue;
        const dx = wl.b.x - wl.a.x;
        const dy = wl.b.y - wl.a.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;
        const xStart = (wl.a.x + (dx / len) * op.offsetMm - ox) * scale;
        const yStart = (wl.a.y + (dy / len) * op.offsetMm - oy) * scale;
        const xEnd =
            (wl.a.x + (dx / len) * (op.offsetMm + op.widthMm) - ox) * scale;
        const yEnd =
            (wl.a.y + (dy / len) * (op.offsetMm + op.widthMm) - oy) * scale;

        if (op.kind === 'window' || op.kind === 'largeWindow') {
            svg += `<line x1="${xStart.toFixed(1)}" y1="${yStart.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#0288d1" stroke-width="5" stroke-linecap="square"/>`;
            svg += `<line x1="${xStart.toFixed(1)}" y1="${yStart.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#ffffff" stroke-width="2"/>`;
        } else if (op.kind === 'entrance') {
            svg += `<line x1="${xStart.toFixed(1)}" y1="${yStart.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#d84315" stroke-width="6" stroke-linecap="square"/>`;
            svg += `<line x1="${xStart.toFixed(1)}" y1="${yStart.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#ffccbc" stroke-width="2"/>`;
        } else {
            svg += `<line x1="${xStart.toFixed(1)}" y1="${yStart.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#ffb74d" stroke-width="4" stroke-linecap="square"/>`;
        }
    }

    svg += `<text x="${(pad + 10).toString()}" y="${(pad + 16).toString()}" font-family="sans-serif" font-size="16" font-weight="bold" fill="#263238">${floor.level.toString()}F</text>`;
    svg += '</svg>';
    return svg;
}
