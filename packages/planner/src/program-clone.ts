import { type BandItem, type BandSpec } from './grid-types.js';
import { type ProgramResult } from './program-types.js';

function cloneItem(it: BandItem): BandItem {
    return { ...it, rooms: [...it.rooms] };
}

function cloneBand(b: BandSpec): BandSpec {
    return {
        ...b,
        items: b.items.map(cloneItem),
        core: b.core ? b.core.map(cloneItem) : null,
        service: b.service ? b.service.map(cloneItem) : null,
        tail: b.tail ? b.tail.map(cloneItem) : null,
    };
}

/** Copy of a program whose bands can be resized and trimmed without touching the original. */
export function cloneProgram(prog: ProgramResult): ProgramResult {
    return {
        ...prog,
        f1: prog.f1.map(cloneBand),
        f2: prog.f2 ? prog.f2.map(cloneBand) : null,
    };
}
