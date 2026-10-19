import { type RowItem, type SolverRoom } from './solver-items.js';
import { type Packed } from './solver-pack.js';
import { type Movable } from './solver-program.js';

type Packer = (items: RowItem[]) => Packed | null;

/**
 * Shares the movable rooms between the front and back rows of a floor. Rooms that want the
 * front row come first in the list; the split that keeps the most of them where they want to
 * be and still packs wins. The back row is listed from its far end, so the last-wanted room
 * (the tatami room, next to the LDK) lands first.
 */
export function packTwoRows(args: {
    readonly movables: readonly Movable[];
    readonly isSunFront: boolean;
    readonly dF: number;
    readonly dB: number;
    readonly fixedFront: readonly RowItem[];
    /** placed first in the back row (next to the LDK) */
    readonly fixedBack: readonly RowItem[];
    readonly packFront: Packer;
    readonly packBack: Packer;
}): { front: SolverRoom[]; back: SolverRoom[] } | null {
    const { movables, isSunFront, dF, dB } = args;
    const wantsFront = (m: Movable): boolean => m.isSunny === isSunFront;
    const ordered = [
        ...movables.filter(wantsFront),
        ...movables.filter((m) => !wantsFront(m)),
    ];
    const preferred = movables.filter(wantsFront).length;
    let best: { front: SolverRoom[]; back: SolverRoom[]; loss: number } | null =
        null;
    // k = how many of the ordered rooms go in the front row; rooms out of their preferred row cost a little
    for (let k = 0; k <= ordered.length; k += 1) {
        const frontItems = [
            ...args.fixedFront,
            ...ordered.slice(0, k).map((m) => m.make(dF)),
        ];
        const backItems = [
            ...args.fixedBack,
            ...ordered
                .slice(k)
                .map((m) => m.make(dB))
                .reverse(),
        ];
        const front = args.packFront(frontItems);
        if (!front) continue;
        const back = args.packBack(backItems);
        if (!back) continue;
        const loss = front.loss + back.loss + Math.abs(k - preferred) * 2;
        if (!best || loss < best.loss)
            best = { front: front.rooms, back: back.rooms, loss };
    }
    return best ? { front: best.front, back: best.back } : null;
}
