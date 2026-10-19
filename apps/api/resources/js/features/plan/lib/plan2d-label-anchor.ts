import { type Fixture, type Point, type Room } from '@aihome/bdm';
import { FIXTURE_CATALOG, isFixtureKind } from '@aihome/planner';
import { computePointsBounds } from './plan2d-geometry';
import { type LabelBox, computeLabelBox } from './plan2d-label-types';

function isPointInPolygon(x: number, y: number, poly: readonly Point[]): boolean {
    if (poly.length < 3) return true;
    let isInside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const pi = poly[i];
        const pj = poly[j];
        if (!pi || !pj) continue;
        const didCross =
            pi.y > y !== pj.y > y &&
            x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x;
        if (didCross) isInside = !isInside;
    }
    return isInside;
}

function computeBoxOverlapArea(a: LabelBox, b: LabelBox): number {
    const ox = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
    const oy = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY));
    return ox * oy;
}

function computeBoxClearance(a: LabelBox, b: LabelBox): number {
    const dx = Math.max(0, b.minX - a.maxX, a.minX - b.maxX);
    const dy = Math.max(0, b.minY - a.maxY, a.minY - b.maxY);
    return Math.hypot(dx, dy);
}

export function buildFixtureObstacleBoxes(
    fixtures: readonly Fixture[],
    rooms: readonly Room[],
): LabelBox[] {
    const boxes: LabelBox[] = [];
    for (const f of fixtures) {
        if (!isFixtureKind(f.kind)) continue;
        const { widthMm, heightMm } = FIXTURE_CATALOG[f.kind];
        const isSwapped = f.rotation === 90 || f.rotation === 270;
        const w = isSwapped ? heightMm : widthMm;
        const h = isSwapped ? widthMm : heightMm;
        const pad = f.kind === 'dining_table_4' || f.kind === 'dining_table_6' ? 500 : 40;
        const extraBottom = f.kind === 'sofa_l' ? h * 0.95 : 0;
        boxes.push({
            minX: f.pos.x - pad,
            maxX: f.pos.x + w + pad,
            minY: f.pos.y - pad,
            maxY: f.pos.y + h + extraBottom + pad,
        });
    }
    for (const r of rooms) {
        if (r.type !== 'stairs') continue;
        const b = computePointsBounds(r.polygon);
        boxes.push({
            minX: b.minX,
            maxX: b.minX + b.width / 2,
            minY: b.minY,
            maxY: b.minY + 460,
        });
    }
    return boxes;
}

export function findBestRoomLabelAnchor(
    room: Room,
    name: string,
    fontSize: number,
    hasJo: boolean,
    fixtureBoxes: readonly LabelBox[],
    allRooms: readonly Room[],
): { x: number; y: number } {
    const b = computePointsBounds(room.polygon);
    const prefX = b.minX + b.width / 2;
    const prefY = b.minY + b.height / 2;
    const roomBox: LabelBox = { minX: b.minX, maxX: b.maxX, minY: b.minY, maxY: b.maxY };

    const obstacles: LabelBox[] = fixtureBoxes.filter(
        (fb) => computeBoxOverlapArea(fb, roomBox) > 0,
    );
    for (const other of allRooms) {
        if (other.id === room.id) continue;
        const ob = computePointsBounds(other.polygon);
        const rawOther: LabelBox = { minX: ob.minX, maxX: ob.maxX, minY: ob.minY, maxY: ob.maxY };
        if (computeBoxOverlapArea(roomBox, rawOther) > 0) {
            obstacles.push({
                minX: ob.minX - 60,
                maxX: ob.maxX + 60,
                minY: ob.minY - 60,
                maxY: ob.maxY + 60,
            });
        }
    }

    if (obstacles.length === 0 && isPointInPolygon(prefX, prefY, room.polygon)) {
        return { x: Math.round(prefX), y: Math.round(prefY) };
    }

    const baseBox = computeLabelBox(0, 0, name, fontSize, hasJo);
    const halfW = (baseBox.maxX - baseBox.minX) / 2;
    const halfH = (baseBox.maxY - baseBox.minY) / 2;
    const padX = Math.min(b.width * 0.42, Math.max(110, halfW + 75));
    const padY = Math.min(b.height * 0.42, Math.max(110, halfH + 75));
    const steps = 6;

    let bestX = prefX;
    let bestY = prefY;
    let bestScore = -Infinity;

    for (let ix = 0; ix <= steps; ix++) {
        const cx = b.minX + padX + ((b.width - padX * 2) * ix) / steps;
        for (let iy = 0; iy <= steps; iy++) {
            const cy = b.minY + padY + ((b.height - padY * 2) * iy) / steps;
            if (!isPointInPolygon(cx, cy, room.polygon)) continue;

            const box = computeLabelBox(cx, cy, name, fontSize, hasJo);
            let overlap = 0;
            let minClear = 1000;
            for (const obs of obstacles) {
                const ov = computeBoxOverlapArea(box, obs);
                overlap += ov;
                minClear = ov === 0 ? Math.min(minClear, computeBoxClearance(box, obs)) : 0;
            }

            const wallClear = Math.max(
                0,
                Math.min(
                    box.minX - (b.minX + 60),
                    b.maxX - 60 - box.maxX,
                    box.minY - (b.minY + 60),
                    b.maxY - 60 - box.maxY,
                ),
            );
            const distToCenter = Math.abs(cx - prefX) * 1.15 + Math.abs(cy - prefY);
            const score =
                overlap > 0
                    ? -1_000_000 - overlap - distToCenter * 0.2
                    : Math.min(minClear, 320) * 12 +
                      Math.min(wallClear, 160) * 6 -
                      distToCenter * 0.35;

            if (score > bestScore) {
                bestScore = score;
                bestX = cx;
                bestY = cy;
            }
        }
    }

    return { x: Math.round(bestX), y: Math.round(bestY) };
}
