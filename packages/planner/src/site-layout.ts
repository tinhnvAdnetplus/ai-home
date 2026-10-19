import { type PlanInput } from './types.js';

type ParkingInput = Pick<
    PlanInput,
    'cars' | 'parkingType' | 'parkingPlacement' | 'frontage' | 'setbackMode'
>;

/*
 * Setbacks. Standard: 1.0 m to the road (plus a 5.5 m parking yard), 1.4 m at the back.
 * Tight, used only when the standard ones leave no room: the 5.0 m parking stall runs from the
 * boundary to the facade (0.5 m without front parking) and 0.6 m at the back (the Civil Code
 * asks for 0.5 m). The sides stay at 0.5 m in both.
 */

/** Whether the cars park on the lot outside the house at all. */
export function hasOpenParking(v: ParkingInput): boolean {
    return v.cars > 0 && v.parkingType !== 'ビルトイン';
}

/** Width (m) that side-by-side 2.5 m stalls take beside the house, with a small gap. */
export function sideParkingWidthM(cars: number): number {
    return cars * 2.5 + 0.3;
}

function hasFrontParking(v: ParkingInput): boolean {
    return hasOpenParking(v) && v.parkingPlacement !== 'side';
}

/** Distance (m) from the road boundary to the front wall. */
export function frontDistanceM(v: ParkingInput): number {
    if (v.setbackMode === 'tight') return hasFrontParking(v) ? 5.0 : 0.5;
    return hasFrontParking(v) ? 6.5 : 1.0;
}

/** Front yard (m) beyond the front setback, kept for open-air parking. */
export function frontYardM(v: ParkingInput): number {
    return hasFrontParking(v)
        ? frontDistanceM(v) - (v.setbackMode === 'tight' ? 0 : 1.0)
        : 0;
}

export function rearSetbackM(v: Pick<PlanInput, 'setbackMode'>): number {
    return v.setbackMode === 'tight' ? 0.6 : 1.4;
}

/** Depth (m) the house may take between the front distance and the rear setback. */
export function buildableDepthM(
    v: ParkingInput & Pick<PlanInput, 'landDepth'>,
): number {
    return v.landDepth - frontDistanceM(v) - rearSetbackM(v);
}

/** Lot frontage (m) left for the house once side parking takes its strip. */
export function houseFrontageM(v: ParkingInput): number {
    return hasOpenParking(v) && v.parkingPlacement === 'side'
        ? v.frontage - sideParkingWidthM(v.cars)
        : v.frontage;
}

/** Extra tsubo of corridor rows (added so every room opens onto a hall) on top of the customer's target. */
export function corridorAllowanceTsubo(
    floors: readonly (readonly { readonly name: string }[])[],
): number {
    return (
        2.4 *
        floors.filter((bands) =>
            bands.some((b) => b.name.startsWith('corridor')),
        ).length
    );
}
