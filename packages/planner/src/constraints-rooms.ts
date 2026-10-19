import { type PlanInput } from './types.js';
import { type DesignConstraints } from './constraints.js';

export function addUnique(
    list: readonly string[] | undefined,
    item: string,
): readonly string[] {
    const arr = list ? [...list] : [];
    if (!arr.includes(item)) arr.push(item);
    return arr;
}

export function removeUnique(
    list: readonly string[] | undefined,
    item: string,
): readonly string[] {
    return list ? list.filter((x) => x !== item) : [];
}

export function applyMustHaveAndAvoidRooms(
    base: PlanInput,
    c: DesignConstraints,
    applied: string[],
    unsatisfied: string[],
): PlanInput {
    let inp = base;

    for (const r of c.mustHaveRooms) {
        const norm = r.toLowerCase();
        if (norm.includes('study') || r === '書斎') {
            inp = {
                ...inp,
                wfh: '書斎が必要',
                extraRooms: addUnique(inp.extraRooms, '書斎'),
            };
            applied.push('MUST_HAVE:study');
        } else if (
            norm.includes('tatami') ||
            norm.includes('washitsu') ||
            r === '和室'
        ) {
            inp = {
                ...inp,
                tatamiRoom:
                    inp.tatamiRoom === 'なし'
                        ? 'リビング続き4.5帖'
                        : inp.tatamiRoom,
            };
            applied.push('MUST_HAVE:tatami');
        } else if (norm.includes('walkin') || norm.includes('wic')) {
            inp = { ...inp, masterCloset: 'ウォークイン' };
            applied.push('MUST_HAVE:walkInCloset');
        } else if (norm.includes('pantry') || r === 'パントリー') {
            inp = { ...inp, waterOpts: addUnique(inp.waterOpts, 'パントリー') };
            applied.push('MUST_HAVE:pantry');
        } else if (
            norm.includes('laundry') ||
            r === 'ランドリー' ||
            r === 'ランドリールーム'
        ) {
            inp = {
                ...inp,
                waterOpts: addUnique(inp.waterOpts, 'ランドリールーム'),
            };
            applied.push('MUST_HAVE:laundry');
        } else if (norm.includes('family') || r === 'ファミリークローゼット') {
            inp = {
                ...inp,
                storageOpts: addUnique(
                    inp.storageOpts,
                    'ファミリークローゼット',
                ),
            };
            applied.push('MUST_HAVE:familyCloset');
        } else if (
            norm.includes('shoe') ||
            norm.includes('sic') ||
            r === '土間収納'
        ) {
            inp = {
                ...inp,
                shoesCloset: 'ウォークスルー',
                extraRooms: addUnique(inp.extraRooms, '土間収納'),
            };
            applied.push('MUST_HAVE:shoeCloset');
        } else if (norm.includes('void') || r === '吹き抜け') {
            if (inp.floors >= 2) {
                inp = {
                    ...inp,
                    extraRooms: addUnique(inp.extraRooms, '吹き抜け'),
                };
                applied.push('MUST_HAVE:void');
            } else {
                unsatisfied.push(
                    'CONSTRAINT_UNSATISFIED:void_on_single_storey',
                );
            }
        } else {
            unsatisfied.push(`CONSTRAINT_UNSATISFIED:${r}`);
        }
    }

    for (const r of c.avoidRooms) {
        const norm = r.toLowerCase();
        if (norm.includes('tatami') || r === '和室') {
            inp = { ...inp, tatamiRoom: 'なし' };
            applied.push('AVOID:tatami');
        } else if (norm.includes('study') || r === '書斎') {
            inp = {
                ...inp,
                wfh: 'なし',
                extraRooms: removeUnique(inp.extraRooms, '書斎'),
            };
            applied.push('AVOID:study');
        } else if (norm.includes('pantry') || r === 'パントリー') {
            inp = {
                ...inp,
                waterOpts: removeUnique(inp.waterOpts, 'パントリー'),
            };
            applied.push('AVOID:pantry');
        } else if (norm.includes('laundry') || r === 'ランドリールーム') {
            inp = {
                ...inp,
                waterOpts: removeUnique(inp.waterOpts, 'ランドリールーム'),
            };
            applied.push('AVOID:laundry');
        } else if (norm.includes('void') || r === '吹き抜け') {
            inp = {
                ...inp,
                extraRooms: removeUnique(inp.extraRooms, '吹き抜け'),
            };
            applied.push('AVOID:void');
        } else if (norm.includes('balcony') || r === 'バルコニー') {
            inp = { ...inp, notNeeded: addUnique(inp.notNeeded, 'バルコニー') };
            applied.push('AVOID:balcony');
        } else if (
            ['ldk', 'master', 'bath', 'toilet', 'entrance'].some((x) =>
                norm.includes(x),
            )
        ) {
            unsatisfied.push(
                `CONSTRAINT_UNSATISFIED:cannot_avoid_core_room_${r}`,
            );
        }
    }

    return inp;
}
