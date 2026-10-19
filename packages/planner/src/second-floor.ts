import { type BandSpec } from './grid-types.js';
import { type GridRoom } from './types.js';

export type FloorBuilder = (
    bandList: BandSpec[],
    name: string,
    totalDepth: number,
) => {
    name: string;
    rooms: GridRoom[];
    gridD: number;
};

export type SecondFloorResult = {
    f1: { name: string; rooms: GridRoom[]; gridD: number };
    f2: { name: string; rooms: GridRoom[]; gridD: number };
    D1: number;
    D2: number;
};

export function adjustSecondFloorDepth(
    initialF1: { name: string; rooms: GridRoom[]; gridD: number },
    f1Bands: BandSpec[],
    f2Bands: BandSpec[],
    W: number,
    initialD1: number,
    maxD: number,
    fixed2: number,
    need2: number,
    masterJo: number,
    buildOne: FloorBuilder,
): SecondFloorResult {
    let D1 = initialD1;
    let f1 = initialF1;
    const minD2 = fixed2 + 3;
    let D2 = Math.min(D1, Math.max(minD2, Math.ceil(need2 / W)));
    let f2 = buildOne(f2Bands, '2F', D2);

    const seen2: Record<string, boolean> = {};
    let t2 = 0;

    while (t2++ < 20) {
        f2 = buildOne(f2Bands, '2F', D2);
        const ms = f2.rooms.find((x) => x.key === 'master');
        if (!ms) break;

        const key2 = `${D1.toString()}/${D2.toString()}`;
        const d2 = masterJo * 2 - ms.cells;
        if (Math.abs(d2) <= Math.max(3, Math.round(W * 0.35)) || seen2[key2]) {
            break;
        }
        seen2[key2] = true;

        if (d2 > 0) {
            if (D2 < D1) {
                D2++;
            } else if (D1 < maxD) {
                D1++;
                D2++;
                f1 = buildOne(f1Bands, '1F', D1);
            } else {
                break;
            }
        } else {
            if (D2 > minD2) {
                D2--;
            } else {
                break;
            }
        }
    }

    return { f1, f2, D1, D2 };
}
