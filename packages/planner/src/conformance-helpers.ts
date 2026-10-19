import { type Room, type Point } from '@aihome/bdm';

export type ConformanceStatus = 'pass' | 'fail' | 'na';

export type ConformanceCheck = {
    readonly id: string;
    readonly label: string;
    readonly expected: string | number | boolean;
    readonly actual: string | number | boolean;
    readonly status: ConformanceStatus;
    readonly message?: string | undefined;
};

export type ConformanceReport = {
    readonly ok: boolean;
    readonly checks: readonly ConformanceCheck[];
    readonly passedCount: number;
    readonly failedCount: number;
    readonly naCount: number;
};

export function shoelaceAreaM2(points: readonly Point[]): number {
    if (points.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        if (p1 && p2) {
            sum += p1.x * p2.y - p2.x * p1.y;
        }
    }
    return Math.abs(sum) / 2_000_000;
}

export function getRoomJo(room: Room): number {
    return Math.round((shoelaceAreaM2(room.polygon) / 1.62) * 10) / 10;
}

function getBoundingBox(pts: readonly Point[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
} {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    return { minX, maxX, minY, maxY };
}

export function checkPolygonsOverlap(
    polyA: readonly Point[],
    polyB: readonly Point[],
): boolean {
    if (polyA.length < 3 || polyB.length < 3) return false;
    const boxA = getBoundingBox(polyA);
    const boxB = getBoundingBox(polyB);

    // If bounding boxes do not overlap in interior with at least 10mm margin, they don't overlap
    const overlapMinX = Math.max(boxA.minX, boxB.minX);
    const overlapMaxX = Math.min(boxA.maxX, boxB.maxX);
    const overlapMinY = Math.max(boxA.minY, boxB.minY);
    const overlapMaxY = Math.min(boxA.maxY, boxB.maxY);

    if (overlapMaxX - overlapMinX <= 10 || overlapMaxY - overlapMinY <= 10) {
        return false;
    }

    // Sample an interior test point inside the bounding box overlap
    const midX = (overlapMinX + overlapMaxX) / 2;
    const midY = (overlapMinY + overlapMaxY) / 2;

    const isInside = (
        pt: { x: number; y: number },
        poly: readonly Point[],
    ): boolean => {
        let isInsidePt = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const pi = poly[i];
            const pj = poly[j];
            if (!pi || !pj) continue;
            const isIntersecting =
                pi.y > pt.y !== pj.y > pt.y &&
                pt.x < ((pj.x - pi.x) * (pt.y - pi.y)) / (pj.y - pi.y) + pi.x;
            if (isIntersecting) isInsidePt = !isInsidePt;
        }
        return isInsidePt;
    };

    return (
        isInside({ x: midX, y: midY }, polyA) &&
        isInside({ x: midX, y: midY }, polyB)
    );
}

export function findRoomsByType(
    rooms: readonly Room[],
    type: string,
): readonly Room[] {
    return rooms.filter((r) => r.type === type);
}

export function findRoomsByName(
    rooms: readonly Room[],
    nameSub: string,
): readonly Room[] {
    return rooms.filter((r) => r.name.includes(nameSub));
}

export function checkAnyFloorOverlap(
    floors: readonly { readonly rooms: readonly Room[] }[],
): boolean {
    for (const fl of floors) {
        for (let i = 0; i < fl.rooms.length; i++) {
            const rA = fl.rooms[i];
            if (!rA) continue;
            for (let j = i + 1; j < fl.rooms.length; j++) {
                const rB = fl.rooms[j];
                if (!rB) continue;
                if (checkPolygonsOverlap(rA.polygon, rB.polygon)) return true;
            }
        }
    }
    return false;
}
