import { type BandSpec, type BandItem } from './grid-types.js';
import { type InternalPlanValues } from './program-types.js';
import { buildFloor1NorthItems } from './rooms-f1-north.js';
import { hallRoom } from './zoning.js';

export function jo2cells(jo: number): number {
    return Math.max(1, Math.round((jo * 1.62) / 0.8281));
}

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function buildFloor1Program(v: InternalPlanValues): {
    f1: BandSpec[];
    need1: number;
} {
    const isTwoFloor = v.floors >= 2;
    const ldkJo = v.ldkSize;
    const isBath2F = isTwoFloor && v.bathFloor === '2階';
    const hasLaundry = has(v.waterOpts, 'ランドリールーム');
    const hasPantry = has(v.waterOpts, 'パントリー');
    const hasSic = (v.shoesCloset ?? 'なし') !== 'なし';
    const sicW = v.shoesCloset === 'ウォークスルー' ? 2 : 1;
    const jr = v.tatamiRoom ?? 'なし';
    const isJrOn = jr !== 'なし';
    const jrJo = jr.includes('6帖') ? 6 : 4.5;
    const masterJo = v.masterSize;
    const kids = v.kidsRooms;
    const kidsJo = v.kidsSize;

    const northItems = buildFloor1NorthItems(v, isTwoFloor, isBath2F, sicW);

    const targetLdkCells = jo2cells(ldkJo);
    const ldkD = ldkJo >= 24 ? 6 : ldkJo >= 17 ? 5 : 4;
    const ldkW = Math.max(4, Math.round(targetLdkCells / ldkD));
    const southItems: BandItem[] = [];

    if (!isTwoFloor) {
        const kW = kidsJo <= 5.5 ? 2 : kidsJo >= 8 ? 4 : 3;
        for (let ki = 0; ki < kids; ki++) {
            southItems.push({
                w: kW,
                min: kW,
                max: kW,
                flex: 0,
                tag: '子ども部屋',
                rooms: [
                    {
                        key: `kids${ki.toString()}`,
                        name: `子ども部屋${kids > 1 ? (ki + 1).toString() : ''}`,
                        type: 'childRoom',
                        d: 4,
                    },
                    {
                        key: `kcl${ki.toString()}`,
                        name: '収納',
                        type: 'closet',
                        d: 'fill',
                    },
                ],
            });
        }
    }

    southItems.push({
        w: ldkW,
        min: Math.min(4, ldkW),
        max: ldkW,
        flex: 0,
        tag: 'LDK',
        targetCells: targetLdkCells,
        rooms: [
            { key: 'ldk', name: 'LDK', type: 'ldk', isMerge: true, d: 'fill' },
        ],
    });

    if (isJrOn) {
        const jrW = jrJo >= 6 ? 4 : 3;
        southItems.push({
            w: jrW,
            min: jrW,
            max: jrW,
            flex: 0,
            tag: '和室',
            rooms: [
                { key: 'washitsu', name: '和室', type: 'washitsu', d: 3 },
                { key: 'oshiire', name: '押入', type: 'closet', d: 'fill' },
            ],
        });
    }
    if (hasPantry) {
        southItems.push({
            w: 1,
            min: 1,
            max: 1,
            flex: 0,
            tag: 'パントリー',
            // short pantry next to the kitchen; the rest of the column stays LDK (no long dead-end slot)
            rooms: [
                { key: 'pantry', name: 'パントリー', type: 'pantry', d: 2 },
                {
                    key: 'ldk',
                    name: 'LDK',
                    type: 'ldk',
                    isMerge: true,
                    d: 'fill',
                },
            ],
        });
    }

    southItems.push({
        w: 1,
        min: 0,
        max: 4,
        flex: 0.5,
        tag: 'リビング収納',
        // short storage; the rest of the column is LDK (no long dead-end slot behind the stair)
        rooms: [
            {
                key: 'livstore',
                name: '収納',
                type: 'closet',
                isMerge: true,
                d: 2,
            },
            { key: 'ldk', name: 'LDK', type: 'ldk', isMerge: true, d: 'fill' },
        ],
    });

    const f1: BandSpec[] = [{ name: 'north1', depth: 4, items: northItems }];
    if (!isTwoFloor) {
        // single storey: a corridor row ties the hall pieces together so the LDK and every room open onto it
        f1.push({
            name: 'corridor1',
            depth: 1,
            items: [
                {
                    w: 1,
                    min: 1,
                    max: 99,
                    flex: 1,
                    tag: '廊下',
                    rooms: [hallRoom('hall', 1)],
                },
            ],
        });
    }
    f1.push({ name: 'south1', depth: ldkD, items: southItems, isLdk: true });

    let need1 = targetLdkCells + 10;
    if (!isBath2F) need1 += 8;
    if (hasLaundry) need1 += 4;
    if (hasSic) need1 += sicW * 2;
    if (isJrOn) need1 += jo2cells(jrJo) + 2;
    if (hasPantry) need1 += 2;
    if (isTwoFloor) need1 += 4;
    else need1 += jo2cells(masterJo) + kids * jo2cells(kidsJo) + 8;

    return { f1, need1 };
}
