import { type BandSpec, type BandItem } from './grid-types.js';
import { type InternalPlanValues } from './program-types.js';
import { jo2cells } from './rooms-f1.js';
import { buildFloor2NorthItems } from './rooms-f2-north.js';
import { hallRoom } from './zoning.js';

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function buildFloor2Program(v: InternalPlanValues): {
    f2: BandSpec[];
    need2: number;
} {
    const kids = v.kidsRooms;
    const kidsJo = v.kidsSize;
    const masterJo = v.masterSize;
    const toilets = v.toilets;
    const hasFamCloset = has(v.storageOpts, 'ファミリークローゼット');
    const hasStudy = has(v.extraRooms, '書斎');
    const isBath2F = v.bathFloor === '2階';

    const kW = kidsJo <= 5.5 ? 2 : kidsJo >= 8 ? 4 : 3;
    const kD = 4;

    const northItems = buildFloor2NorthItems(v, kW, kD);

    const southItems: BandItem[] = [];
    if (kids >= 1) {
        southItems.push({
            w: kW,
            min: kW,
            max: kW,
            flex: 0,
            tag: '子ども部屋1',
            rooms: [
                {
                    key: 'kids0',
                    name: kids > 1 ? '子ども部屋1' : '子ども部屋',
                    type: 'childRoom',
                    d: kD,
                },
            ],
        });
    }
    if (kids >= 3) {
        southItems.push({
            w: kW,
            min: kW,
            max: kW,
            flex: 0,
            tag: '子ども部屋3',
            rooms: [
                { key: 'kids2', name: '子ども部屋3', type: 'childRoom', d: kD },
            ],
        });
    }

    const mW = masterJo <= 7 ? 3 : masterJo <= 8 ? 4 : masterJo <= 10 ? 5 : 6;
    const mD = 4;
    southItems.push({
        w: mW,
        min: mW,
        max: mW,
        flex: 0,
        tag: '主寝室',
        rooms: [{ key: 'master', name: '主寝室', type: 'bedroom', d: mD }],
    });
    southItems.push({
        w: 2,
        min: 1,
        max: 2,
        flex: 0,
        tag: 'WIC',
        rooms: [
            {
                key: 'wic',
                name: v.masterCloset === 'クローゼット' ? 'CL' : 'WIC',
                type: 'closet',
                d: 'fill',
            },
        ],
    });
    southItems.push({
        w: 1,
        min: 0,
        max: 10,
        flex: 1.0,
        tag: '2階収納',
        rooms: [{ key: 'f2store2', name: '収納', type: 'closet', d: 'fill' }],
    });

    // 1-cell corridor links the stair landing with every bedroom (no room-to-room transit)
    const corridorItem: BandItem = {
        w: 1,
        min: 1,
        max: 99,
        flex: 1,
        tag: '廊下',
        rooms: [hallRoom('hall2', 1)],
    };
    const f2: BandSpec[] = [
        { name: 'north2', depth: 4, items: northItems },
        { name: 'corridor2', depth: 1, items: [corridorItem] },
        { name: 'south2', depth: 4, items: southItems },
    ];

    let need2 = jo2cells(masterJo) + kids * jo2cells(kidsJo) + 8;
    if (toilets >= 2) need2 += 2;
    if (hasFamCloset) need2 += 4;
    if (hasStudy) need2 += 4;
    if (isBath2F) need2 += 8;

    return { f2, need2 };
}
