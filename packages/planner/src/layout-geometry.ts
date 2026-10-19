import { type Floor, type Point, type Room } from '@aihome/bdm';

export function polygonBounds(poly: readonly Point[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
} {
    const xs = poly.map((p) => p.x);
    const ys = poly.map((p) => p.y);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

export function pointInPolygon(
    x: number,
    y: number,
    poly: readonly Point[],
): boolean {
    let isIn = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const [a, b] = [poly[i], poly[j]];
        if (
            a &&
            b &&
            a.y > y !== b.y > y &&
            x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
        ) {
            isIn = !isIn;
        }
    }
    return isIn;
}

export function roomAt(floor: Floor, x: number, y: number): Room | undefined {
    return floor.rooms.find((r) => pointInPolygon(x, y, r.polygon));
}

export function floorBounds(floor: Floor): { maxX: number; maxY: number } {
    const xs = floor.walls.flatMap((w) => [w.a.x, w.b.x]);
    const ys = floor.walls.flatMap((w) => [w.a.y, w.b.y]);
    return { maxX: Math.max(0, ...xs), maxY: Math.max(0, ...ys) };
}
