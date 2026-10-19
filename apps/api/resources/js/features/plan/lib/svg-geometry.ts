import { type BuildingModel, type Floor, type Point } from '@aihome/bdm';
import { type ViewportBounds } from '../types/plan-view-types';

export function pointsToSvgString(pts: readonly Point[]): string {
    return pts.map((p) => `${p.x.toString()},${p.y.toString()}`).join(' ');
}

export function computePolygonBounds(pts: readonly Point[]): ViewportBounds {
    if (pts.length === 0) {
        return { minX: 0, minY: 0, width: 1000, height: 1000 };
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
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
    };
}

export function computePolygonCentroid(pts: readonly Point[]): Point {
    if (pts.length === 0) {
        return { x: 0, y: 0 };
    }
    const bounds = computePolygonBounds(pts);
    return {
        x: bounds.minX + bounds.width / 2,
        y: bounds.minY + bounds.height / 2,
    };
}

export function computeModelViewBox(
    model: BuildingModel,
    marginMm = 1800,
): ViewportBounds {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of model.site.boundary) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    for (const floor of model.floors) {
        for (const room of floor.rooms) {
            for (const p of room.polygon) {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            }
        }
    }

    if (minX === Infinity) {
        return { minX: -1000, minY: -1000, width: 12000, height: 16000 };
    }

    const boxMinX = minX - marginMm;
    const boxMinY = minY - marginMm;
    const boxWidth = maxX - minX + marginMm * 2;
    const boxHeight = maxY - minY + marginMm * 2;

    return {
        minX: Math.round(boxMinX),
        minY: Math.round(boxMinY),
        width: Math.round(boxWidth),
        height: Math.round(boxHeight),
    };
}

export function computeFloorBuildingViewBox(
    floor: Floor,
    margin = { top: 2200, bottom: 2800, left: 2200, right: 2000 },
    extraPoints: readonly Point[] = [],
): ViewportBounds {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const includePoint = (p: Point): void => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    };

    for (const room of floor.rooms) {
        for (const p of room.polygon) includePoint(p);
    }

    for (const stair of floor.stairs) {
        for (const p of stair.polygon) includePoint(p);
    }

    for (const wall of floor.walls) {
        includePoint(wall.a);
        includePoint(wall.b);
    }

    for (const p of extraPoints) {
        includePoint(p);
    }

    if (minX === Infinity) {
        return { minX: 0, minY: 0, width: 9000, height: 11000 };
    }

    const boxMinX = minX - margin.left;
    const boxMinY = minY - margin.top;
    const boxWidth = maxX - minX + margin.left + margin.right;
    const boxHeight = maxY - minY + margin.top + margin.bottom;

    return {
        minX: Math.round(boxMinX),
        minY: Math.round(boxMinY),
        width: Math.round(boxWidth),
        height: Math.round(boxHeight),
    };
}

export function formatViewBox(bounds: ViewportBounds): string {
    return `${bounds.minX.toString()} ${bounds.minY.toString()} ${bounds.width.toString()} ${bounds.height.toString()}`;
}

export const DEFAULT_VIEWPORT_BOUNDS: ViewportBounds = {
    minX: -2000,
    minY: -2000,
    width: 14000,
    height: 16000,
};

export const FLOOR_VIEWBOX_PADDING = {
    top: 2200,
    bottom: 3000,
    left: 2000,
    right: 1800,
};
