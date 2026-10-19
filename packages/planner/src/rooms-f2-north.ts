import { type BandItem } from './grid-types.js';
import { type InternalPlanValues } from './program-types.js';
import { hallRoom } from './zoning.js';

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function buildFloor2NorthItems(
    v: InternalPlanValues,
    kW: number,
    kD: number,
): BandItem[] {
    const kids = v.kidsRooms;
    const toilets = v.toilets;
    const hasFamCloset = has(v.storageOpts, 'ファミリークローゼット');
    const hasStudy = has(v.extraRooms, '書斎');
    const hasWash2 = has(v.waterOpts, '2階洗面');
    const isBath2F = v.bathFloor === '2階';

    const northItems: BandItem[] = [];
    if (isBath2F) {
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
    if (kids >= 2) {
        northItems.push({
            w: kW,
            min: kW,
            max: kW,
            flex: 0,
            tag: '子ども部屋2',
            rooms: [
                { key: 'kids1', name: '子ども部屋2', type: 'childRoom', d: kD },
            ],
        });
    }
    if (toilets >= 2) {
        northItems.push({
            w: 1,
            min: 1,
            max: 1,
            flex: 0,
            tag: 'トイレ2',
            rooms: [
                { key: 'wc2', name: 'トイレ', type: 'toilet', d: 2 },
                hallRoom('hall2', 2),
            ],
        });
    }
    if (hasWash2 && !isBath2F) {
        northItems.push({
            w: 1,
            min: 1,
            max: 1,
            flex: 0,
            tag: '2階洗面',
            rooms: [
                { key: 'wash2', name: '洗面', type: 'wash', d: 2 },
                hallRoom('hall2', 2),
            ],
        });
    }
    if (hasFamCloset) {
        northItems.push({
            w: 2,
            min: 2,
            max: 2,
            flex: 0,
            tag: 'ファミクロ',
            rooms: [{ key: 'fcl', name: 'ファミクロ', type: 'closet', d: 4 }],
        });
    }
    if (hasStudy) {
        northItems.push({
            w: 2,
            min: 2,
            max: 2,
            flex: 0,
            tag: '書斎',
            rooms: [{ key: 'study', name: '書斎', type: 'study', d: 4 }],
        });
    }
    northItems.push({
        w: 1,
        min: 0,
        max: 10,
        flex: 1.0,
        tag: '2階収納',
        rooms: [{ key: 'f2store', name: '収納', type: 'closet', d: 4 }],
    });
    northItems.push({
        w: 2,
        min: 2,
        max: 2,
        flex: 0,
        isStair: true,
        tag: '階段',
        rooms: [
            { key: 'stair2', name: '階段', type: 'stairs', d: 3 },
            hallRoom('hall2', 1),
        ],
    });

    return northItems;
}
