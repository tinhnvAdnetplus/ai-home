import {
    type Exterior,
    type Floor,
    type Parking,
    type Point,
    type Room,
    type Site,
} from '@aihome/bdm';
import {
    type DimensionChain,
    type DimensionTick,
    type RoomBounds,
} from './plan2d-types';
import { GRID_MM } from './plan2d-colors';

export function calculateJo(areaM2: number): string {
    const jo = Math.round((areaM2 / 1.6562) * 10) / 10;
    return jo.toFixed(1);
}

export function collectExteriorPoints(
    site?: Site,
    parking?: Parking,
    exterior?: Exterior,
): Point[] {
    const pts: Point[] = [];
    if (site) pts.push(...site.boundary);
    if (parking?.polygon) pts.push(...parking.polygon);
    if (exterior?.deckPolygon) pts.push(...exterior.deckPolygon);
    if (exterior?.approachPolygon) pts.push(...exterior.approachPolygon);
    if (exterior?.trees) {
        for (const t of exterior.trees) {
            pts.push(
                { x: t.pos.x - t.radiusMm, y: t.pos.y - t.radiusMm },
                { x: t.pos.x + t.radiusMm, y: t.pos.y + t.radiusMm },
            );
        }
    }
    return pts;
}

export function computePointsBounds(pts: readonly Point[]): RoomBounds {
    if (pts.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
}

export function computeFloorBounds(floor: Floor): RoomBounds {
    const allPoints: Point[] = [];
    for (const r of floor.rooms) {
        allPoints.push(...r.polygon);
    }
    for (const w of floor.walls) {
        allPoints.push(w.a, w.b);
    }
    return computePointsBounds(allPoints);
}

export function computeDimensionChains(
    floor: Floor,
    outerBounds?: RoomBounds,
): {
    readonly topChain: DimensionChain;
    readonly leftChain: DimensionChain;
} {
    const bounds = computeFloorBounds(floor);
    const startX = Math.floor(bounds.minX / GRID_MM) * GRID_MM;
    const endX = Math.ceil(bounds.maxX / GRID_MM) * GRID_MM;
    const startY = Math.floor(bounds.minY / GRID_MM) * GRID_MM;
    const endY = Math.ceil(bounds.maxY / GRID_MM) * GRID_MM;

    const topTicks: DimensionTick[] = [];
    for (let x = startX; x <= endX; x += GRID_MM) {
        topTicks.push({ pos: x, label: GRID_MM.toString() });
    }

    const leftTicks: DimensionTick[] = [];
    for (let y = startY; y <= endY; y += GRID_MM) {
        leftTicks.push({ pos: y, label: GRID_MM.toString() });
    }

    const totalWidthMm = endX - startX;
    const totalHeightMm = endY - startY;
    const minY = outerBounds ? Math.min(bounds.minY, outerBounds.minY) : bounds.minY;
    const minX = outerBounds ? Math.min(bounds.minX, outerBounds.minX) : bounds.minX;

    return {
        topChain: {
            offset: minY - 700,
            start: startX,
            end: endX,
            totalLabel: totalWidthMm.toLocaleString(),
            ticks: topTicks,
        },
        leftChain: {
            offset: minX - 700,
            start: startY,
            end: endY,
            totalLabel: totalHeightMm.toLocaleString(),
            ticks: leftTicks,
        },
    };
}

export function computeRoomLabelAnchor(room: Room): { x: number; y: number } {
    const bounds = computePointsBounds(room.polygon);
    if (room.type === 'ldk' && bounds.width >= 3600 && bounds.height >= 3000) {
        return {
            x: Math.round(bounds.minX + bounds.width * 0.65),
            y: Math.round(bounds.minY + bounds.height * 0.72),
        };
    }
    return {
        x: Math.round(bounds.minX + bounds.width / 2),
        y: Math.round(bounds.minY + bounds.height / 2),
    };
}
