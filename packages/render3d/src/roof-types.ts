export type RoofBounds = {
    readonly x1: number;
    readonly x2: number;
    readonly z1: number;
    readonly z2: number;
    readonly yBase: number;
    readonly overhang?: number | undefined;
};
