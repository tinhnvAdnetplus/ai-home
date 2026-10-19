import { type PlanInput } from './types.js';
import { nearWithCloset, single, type RowItem } from './solver-items.js';
import {
    entranceBlock,
    masterBlock,
    stairsBlock,
    wetBlock,
} from './solver-blocks.js';

const has = (arr: readonly string[] | undefined, v: string): boolean =>
    Array.isArray(arr) && arr.includes(v);

/** 1 帖 is two grid cells. */
export const joCells = (jo: number): number => Math.round(jo * 2);

/** A room that may go in either row; built for the depth of the row it lands in. */
export type Movable = {
    readonly make: (d: number) => RowItem;
    /** bedrooms want the sunny row; utility rooms the other one */
    readonly isSunny: boolean;
};

export type SolverProgram = {
    readonly floors: 1 | 2;
    readonly ldkCells: number;
    readonly hasPantry: boolean;
    /** entrance first, then the shoe closet beside it (front row only) */
    readonly entrance: () => RowItem[];
    readonly stairs: (d: number) => RowItem;
    /** first-floor rooms besides the entrance (and, single storey, the bedrooms) */
    readonly ground: readonly Movable[];
    /** second-floor rooms (empty for a single storey) */
    readonly upper: readonly Movable[];
};

const fixed = (it: RowItem, isSunny = false): Movable => ({
    make: () => it,
    isSunny,
});

function bedrooms(v: PlanInput): Movable[] {
    const out: Movable[] = [];
    const master = joCells(v.masterSize);
    const room = (
        id: string,
        name: string,
        type: 'bedroom' | 'childRoom',
        cells: number,
    ): Movable =>
        fixed(
            single(id, name, type, cells, 3, Math.ceil(cells / 3) + 1, 3),
            true,
        );
    const hasWic = (v.masterCloset ?? 'ウォークイン') === 'ウォークイン';
    out.push(fixed(masterBlock(master, hasWic), true));
    const kids = joCells(v.kidsSize);
    for (let i = 0; i < v.kidsRooms; i += 1) {
        const name =
            v.kidsRooms > 1 ? `子ども部屋${(i + 1).toString()}` : '子ども部屋';
        out.push(room(`kids${i.toString()}`, name, 'childRoom', kids));
    }
    if (has(v.extraRooms, '書斎') || v.wfh === '書斎が必要')
        out.push(fixed(single('study', '書斎', 'study', 6, 2, 3, 2), true));
    return out;
}

/**
 * The customer's rooms for the solver. Returns null for programs it does not handle
 * (bath upstairs); the band planner's plan is kept for those.
 */
export function solverProgram(v: PlanInput): SolverProgram | null {
    const isTwo = v.floors === 2;
    if (isTwo && v.bathFloor === '2階') return null;
    const hasSic =
        (v.shoesCloset ?? 'なし') !== 'なし' || has(v.extraRooms, '土間収納');
    const tatami = v.tatamiRoom ?? 'なし';
    const tatamiJo = tatami.includes('8帖')
        ? 8
        : tatami.includes('6帖')
          ? 6
          : 4.5;

    const ground: Movable[] = [
        fixed(nearWithCloset('wc1', 'トイレ', 'toilet', 2, 1)),
    ];
    ground.push({ make: (d) => wetBlock(d), isSunny: false });
    if (has(v.waterOpts, 'ランドリールーム'))
        ground.push(
            fixed(single('laundry', 'ランドリー', 'laundry', 4, 1, 2, 2)),
        );
    if (tatami !== 'なし')
        ground.push(
            fixed(
                single(
                    'washitsu',
                    '和室',
                    'washitsu',
                    joCells(tatamiJo),
                    3,
                    5,
                    3,
                ),
                true,
            ),
        );

    const util: Movable[] = [];
    if (v.toilets >= 2)
        util.push(fixed(nearWithCloset('wc2', 'トイレ', 'toilet', 2, 1)));
    if (isTwo && has(v.waterOpts, '2階洗面'))
        util.push(fixed(single('wash2', '洗面', 'wash', 4, 2, 2, 2)));
    if (has(v.storageOpts, 'ファミリークローゼット'))
        util.push(fixed(single('famcl', 'ファミクロ', 'closet', 4, 2, 3, 2)));

    const beds = bedrooms(v);
    return {
        floors: v.floors,
        ldkCells: joCells(v.ldkSize),
        hasPantry: has(v.waterOpts, 'パントリー'),
        entrance: () =>
            hasSic
                ? [entranceBlock(2), single('sic', 'SIC', 'closet', 4, 1, 2, 2)]
                : [entranceBlock(2)],
        stairs: (d) => stairsBlock(d),
        ground: isTwo ? ground : [...ground, ...beds, ...util],
        upper: isTwo ? [...beds, ...util] : [],
    };
}
