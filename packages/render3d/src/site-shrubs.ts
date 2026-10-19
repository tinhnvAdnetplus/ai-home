import { type GroundBox } from './site-plan.js';

const SHRUB_GAP = 0.45;

/** Whether a shrub of the given radius at (x, z) would sit on any kept-clear ground. */
export function isShrubBlocked(
    x: number,
    z: number,
    keepClear: readonly GroundBox[],
): boolean {
    return keepClear.some(
        (b) =>
            x > b.minX - SHRUB_GAP &&
            x < b.maxX + SHRUB_GAP &&
            z > b.minZ - SHRUB_GAP &&
            z < b.maxZ + SHRUB_GAP,
    );
}

export type ShrubSpot = {
    readonly x: number;
    readonly z: number;
    readonly size: number;
    readonly isBerry: boolean;
};

/** Shrubs along both side fences and the road edge, leaving out any that would sit on kept-clear ground. */
export function planShrubs(
    lot: GroundBox,
    keepClear: readonly GroundBox[],
): ShrubSpot[] {
    const spots: ShrubSpot[] = [];
    const lotDepth = Math.max(8, lot.maxZ - lot.minZ);
    for (let i = 0; i < 5; i += 1) {
        const z = lot.minZ + 1.5 + i * ((lotDepth - 3) / 5);
        spots.push({ x: lot.minX + 0.5, z, size: 0.4, isBerry: i % 2 === 0 });
        spots.push({ x: lot.maxX - 0.5, z, size: 0.4, isBerry: i % 2 === 1 });
    }
    const start = lot.minX + 0.6;
    const span = lot.maxX - 0.6 - start;
    const count = Math.max(2, Math.floor(span / 0.9));
    for (let i = 0; i <= count; i += 1) {
        spots.push({
            x: start + (i / count) * span,
            z: lot.maxZ - 0.35,
            size: 0.38,
            isBerry: i % 2 === 0,
        });
    }
    return spots.filter((sp) => !isShrubBlocked(sp.x, sp.z, keepClear));
}

export type TreeSpot = {
    readonly x: number;
    readonly z: number;
    readonly size: number;
};

const EAVE = 0.6; // roof overhang past the walls
const CANOPY = 1.6; // tree crown radius at size ~1.2, plus a little air

/** The ground the house covers, roof overhang included; shrubs and trees stay off it. */
export function houseGround(house: GroundBox): GroundBox {
    return {
        minX: house.minX - EAVE,
        maxX: house.maxX + EAVE,
        minZ: house.minZ - EAVE,
        maxZ: house.maxZ + EAVE,
    };
}

function isTreeFree(
    x: number,
    z: number,
    lot: GroundBox,
    keepClear: readonly GroundBox[],
): boolean {
    const isInLot =
        x - 1.0 >= lot.minX &&
        x + 1.0 <= lot.maxX &&
        z - 1.0 >= lot.minZ &&
        z + 1.0 <= lot.maxZ;
    return (
        isInLot &&
        !keepClear.some(
            (b) =>
                x > b.minX - CANOPY &&
                x < b.maxX + CANOPY &&
                z > b.minZ - CANOPY &&
                z < b.maxZ + CANOPY,
        )
    );
}

/**
 * Two garden trees in the back corners. A corner the house (or parking) takes is replaced by
 * the nearest free spot along the back and the sides; with no free ground the tree is left out.
 */
export function planTrees(
    lot: GroundBox,
    keepClear: readonly GroundBox[],
): TreeSpot[] {
    const wanted: readonly TreeSpot[] = [
        { x: lot.maxX - 1.4, z: lot.minZ + 1.8, size: 1.25 },
        { x: lot.minX + 1.4, z: lot.minZ + 2.0, size: 1.1 },
    ];
    const out: TreeSpot[] = [];
    for (const t of wanted) {
        const candidates: { x: number; z: number }[] = [];
        for (let dz = 0; dz <= lot.maxZ - lot.minZ; dz += 1) {
            for (let dx = 0; dx <= lot.maxX - lot.minX; dx += 1) {
                const x = t.x < (lot.minX + lot.maxX) / 2 ? t.x + dx : t.x - dx;
                candidates.push({ x, z: t.z + dz });
            }
        }
        candidates.sort(
            (a, b) =>
                Math.hypot(a.x - t.x, a.z - t.z) -
                Math.hypot(b.x - t.x, b.z - t.z),
        );
        const spot = candidates.find(
            (c) =>
                isTreeFree(c.x, c.z, lot, keepClear) &&
                out.every((o) => Math.hypot(o.x - c.x, o.z - c.z) > 3),
        );
        if (spot) out.push({ ...spot, size: t.size });
    }
    return out;
}
