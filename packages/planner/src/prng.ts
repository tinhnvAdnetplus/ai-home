export type Prng = () => number;

export function createPrng(initialSeed: number): Prng {
    let s = initialSeed | 0;
    if (s === 0) {
        s = 1;
    }
    return function next(): number {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
