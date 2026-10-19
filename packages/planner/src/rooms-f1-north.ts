import { type BandItem } from './grid-types.js';
import { type InternalPlanValues } from './program-types.js';
import { hallRoom } from './zoning.js';

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function buildFloor1NorthItems(
    v: InternalPlanValues,
    isTwoFloor: boolean,
    isBath2F: boolean,
    sicW: number,
): BandItem[] {
    const hasLaundry = has(v.waterOpts, 'ランドリールーム');
    const hasSic = (v.shoesCloset ?? 'なし') !== 'なし';
    const masterJo = v.masterSize;

    const northItems: BandItem[] = [];
    if (!isBath2F) {
        northItems.push({
            w: 2,
            min: 2,
            max: 2,
            flex: 0,
            tag: '浴室・洗面',
            rooms: [
                { key: 'bath', name: '浴室', type: 'bath', d: 2 },
                { key: 'wash', name: '洗面脱衣室', type: 'wash', d: 2 },
            ],
        });
    }
    if (hasLaundry) {
        northItems.push({
            w: 1,
            min: 1,
            max: 1,
            flex: 0,
            tag: 'ランドリー',
            rooms: [
                { key: 'laundry', name: 'ランドリー', type: 'laundry', d: 2 },
                hallRoom('hall', 2),
            ],
        });
    }
    northItems.push({
        w: 1,
        min: 1,
        max: 1,
        flex: 0,
        tag: 'トイレ',
        rooms: [
            { key: 'wc1', name: 'トイレ', type: 'toilet', d: 2 },
            hallRoom('hall', 2),
        ],
    });
    if (hasSic) {
        northItems.push({
            w: sicW,
            min: 1,
            max: sicW,
            flex: 0,
            tag: 'SIC',
            drop: 2,
            rooms: [
                { key: 'sic', name: 'SIC', type: 'closet', d: 2 },
                hallRoom('hall', 2),
            ],
        });
    }
    // entrance must be usable: at least 2 cells (1.8 m) wide
    northItems.push({
        w: 2,
        min: 2,
        max: 4,
        flex: 0.5,
        tag: '玄関・ホール',
        rooms: [
            { key: 'entry', name: '玄関', type: 'entrance', d: 2 },
            hallRoom('hall', 2),
        ],
    });

    if (isTwoFloor) {
        northItems.push({
            w: 2,
            min: 2,
            max: 2,
            flex: 0,
            isStair: true,
            tag: '階段',
            rooms: [
                { key: 'stair1', name: '階段', type: 'stairs', d: 3 },
                hallRoom('hall', 1),
            ],
        });
    } else {
        const mW =
            masterJo <= 7 ? 3 : masterJo <= 8 ? 4 : masterJo <= 10 ? 5 : 6;
        northItems.push({
            w: mW,
            min: mW,
            max: mW,
            flex: 0,
            tag: '主寝室',
            rooms: [{ key: 'master', name: '主寝室', type: 'bedroom', d: 4 }],
        });
        northItems.push({
            w: 2,
            min: 2,
            max: 2,
            flex: 0,
            tag: 'WIC',
            rooms: [
                { key: 'wic', name: 'WIC', type: 'closet', d: 2 },
                hallRoom('hall', 2),
            ],
        });
    }

    return northItems;
}
