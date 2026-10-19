import { type BuildingModel, type Polygon } from '@aihome/bdm';
import { toThreeX, toThreeZ } from './coords.js';
import { type GroundBox } from './site-plan.js';

export function polygonToGroundBox(
    poly: Polygon | undefined,
    padM = 0,
): GroundBox | null {
    if (!poly || poly.length < 3) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of poly) {
        const x = toThreeX(p.x);
        const z = toThreeZ(p.y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }
    if (!Number.isFinite(minX)) return null;
    return {
        minX: minX - padM,
        maxX: maxX + padM,
        minZ: minZ - padM,
        maxZ: maxZ + padM,
    };
}

/** Lot (fence lines) and house extents in scene metres. */
export function computeExtents(model: BuildingModel) {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    let [hMinX, hMaxX, hMinZ, hMaxZ] = [
        Infinity,
        -Infinity,
        Infinity,
        -Infinity,
    ];
    for (const pt of model.site.boundary) {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
    }
    for (const f of model.floors) {
        for (const w of f.walls) {
            hMinX = Math.min(hMinX, toThreeX(w.a.x), toThreeX(w.b.x));
            hMaxX = Math.max(hMaxX, toThreeX(w.a.x), toThreeX(w.b.x));
            hMinZ = Math.min(hMinZ, toThreeZ(w.a.y), toThreeZ(w.b.y));
            hMaxZ = Math.max(hMaxZ, toThreeZ(w.a.y), toThreeZ(w.b.y));
        }
    }
    const hasBounds = Number.isFinite(minX);
    return {
        minX: hasBounds ? toThreeX(minX) - 0.4 : -0.4,
        maxX: hasBounds ? toThreeX(maxX) + 0.4 : 9.4,
        minZ: hasBounds ? toThreeZ(maxY) - 0.4 : -14.0,
        maxZ: hasBounds ? toThreeZ(minY) + 0.2 : 0.2,
        houseMinX: Number.isFinite(hMinX) ? hMinX : 1.5,
        houseMaxX: Number.isFinite(hMaxX) ? hMaxX : 7.5,
        houseMinZ: Number.isFinite(hMinZ) ? hMinZ : -8,
        houseMaxZ: Number.isFinite(hMaxZ) ? hMaxZ : 0,
    };
}

export function findEntrancePos(model: BuildingModel): {
    x: number;
    z: number;
} {
    const f1 = model.floors[0];
    const door = f1?.openings.find((o) => o.kind === 'entrance');
    const wall = f1?.walls.find((w) => w.id === door?.wallId);
    if (door && wall) {
        const len = Math.max(
            1,
            Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y),
        );
        const r = (door.offsetMm + door.widthMm / 2) / len;
        return {
            x: toThreeX(wall.a.x + (wall.b.x - wall.a.x) * r),
            z: toThreeZ(wall.a.y + (wall.b.y - wall.a.y) * r),
        };
    }
    return { x: 2.0, z: -1.0 };
}
