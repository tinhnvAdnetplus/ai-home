import { type ParkingKind } from '@aihome/bdm';

/** Axis-aligned box on the ground, in scene metres (z grows towards the road). */
export type GroundBox = {
    readonly minX: number;
    readonly maxX: number;
    readonly minZ: number;
    readonly maxZ: number;
};

export type SitePlanInput = {
    readonly lot: GroundBox;
    readonly house: GroundBox;
    readonly entX: number;
    readonly spaces: number;
    readonly kind: ParkingKind;
    readonly parkingOverride?: GroundBox | null | undefined;
};

export type SitePlan = {
    readonly parking: GroundBox | null;
    readonly spaces: number;
    readonly gatePostX: number | null;
    readonly keepClear: readonly GroundBox[];
};

export const SPACE_W = 2.5;
export const PAD_D = 5.2;
const EDGE = 0.3;
const HOUSE_GAP = 0.3;
const PATH_HALF = 0.55 + 0.35;
const POST_OFFSET = 1.05;
const POST_HALF = 0.24;
const WALL_GAP = 0.25;

function overlapsX(a: GroundBox, minX: number, maxX: number): boolean {
    return a.minX < maxX && minX < a.maxX;
}

function padAt(cx: number, w: number, lot: GroundBox, house: GroundBox): GroundBox {
    const front = lot.maxZ - 0.2;
    const minX = cx - w / 2;
    const maxX = cx + w / 2;
    const room = overlapsX(house, minX, maxX) ? front - house.maxZ - WALL_GAP : PAD_D;
    return { minX, maxX, minZ: front - Math.min(PAD_D, room), maxZ: front };
}

function fitsLot(p: GroundBox, lot: GroundBox): boolean {
    return p.minX >= lot.minX + EDGE - 1e-6 && p.maxX <= lot.maxX - EDGE + 1e-6;
}

export function spacesThatFit(lot: GroundBox, spaces: number): number {
    const room = lot.maxX - lot.minX - 2 * EDGE;
    return Math.max(0, Math.min(spaces, Math.floor(room / SPACE_W + 1e-6)));
}

function placeParking(input: SitePlanInput, spaces: number): GroundBox | null {
    const { lot, house, entX } = input;
    if (spaces <= 0) return null;
    const w = spaces * SPACE_W;
    const isEntLeft = entX < (house.minX + house.maxX) / 2;
    const right = padAt(house.maxX + HOUSE_GAP + w / 2, w, lot, house);
    const left = padAt(house.minX - HOUSE_GAP - w / 2, w, lot, house);
    const farRight = padAt(lot.maxX - EDGE - w / 2, w, lot, house);
    const farLeft = padAt(lot.minX + EDGE + w / 2, w, lot, house);
    const rightOfPath = padAt(entX + PATH_HALF + w / 2, w, lot, house);
    const leftOfPath = padAt(entX - PATH_HALF - w / 2, w, lot, house);
    const order = isEntLeft
        ? [right, left, farRight, rightOfPath, farLeft, leftOfPath]
        : [left, right, farLeft, leftOfPath, farRight, rightOfPath];
    const isClearOfPath = (p: GroundBox): boolean => !overlapsX(p, entX - PATH_HALF, entX + PATH_HALF);
    return order.find((p) => fitsLot(p, lot) && isClearOfPath(p)) ?? (isEntLeft ? farRight : farLeft);
}

function placeGatePost(lot: GroundBox, parking: GroundBox | null, entX: number): number | null {
    const isFree = (x: number): boolean =>
        x - POST_HALF - EDGE >= lot.minX &&
        x + POST_HALF + EDGE <= lot.maxX &&
        !(parking && overlapsX(parking, x - POST_HALF - 0.1, x + POST_HALF + 0.1));
    const awayFromPad =
        parking && (parking.minX + parking.maxX) / 2 > entX
            ? -1
            : parking
              ? 1
              : entX > (lot.minX + lot.maxX) / 2
                ? -1
                : 1;
    const candidates = [entX + awayFromPad * POST_OFFSET, entX - awayFromPad * POST_OFFSET];
    if (parking) {
        candidates.push(parking.minX - 0.1 - POST_HALF, parking.maxX + 0.1 + POST_HALF);
    }
    const [first, ...rest] = candidates.filter(isFree);
    if (first === undefined) return null;
    if (first === candidates[0]) return first;
    return rest.reduce((best, x) => (Math.abs(x - entX) < Math.abs(best - entX) ? x : best), first);
}

export function planSite(input: SitePlanInput): SitePlan {
    const { lot, house, entX, parkingOverride } = input;
    const rawSpaces = input.kind === 'garage' ? 0 : spacesThatFit(lot, input.spaces);
    const parking = parkingOverride !== undefined ? parkingOverride : placeParking(input, rawSpaces);
    const spaces = parkingOverride
        ? Math.max(1, Math.min(input.spaces, Math.round((parkingOverride.maxX - parkingOverride.minX) / SPACE_W)))
        : rawSpaces;
    const gatePostX = placeGatePost(lot, parking, entX);
    const pathBox: GroundBox = {
        minX: Math.min(entX - PATH_HALF, (gatePostX ?? entX) - 0.5),
        maxX: Math.max(entX + PATH_HALF, (gatePostX ?? entX) + 0.5),
        minZ: house.maxZ,
        maxZ: lot.maxZ,
    };
    const keepClear = parking ? [parking, pathBox] : [pathBox];
    return { parking, spaces, gatePostX, keepClear };
}
