export type RoofBounds = {
    readonly x1: number;
    readonly x2: number;
    readonly z1: number;
    readonly z2: number;
    readonly yBase: number;
    readonly overhang?: number | undefined;
    /**
     * Outer faces of the supporting top-storey walls (Three.js metres). Infill under the roof
     * (gable triangles, eave friezes, shed side walls) sits on this plane so it is flush with
     * the walls below; without it the centreline box inset by `overhang` is used.
     */
    readonly wall?:
        | {
              readonly x1: number;
              readonly x2: number;
              readonly z1: number;
              readonly z2: number;
          }
        | undefined;
};

/** Outer wall-face rectangle of a roof (falls back to the overhang-inset bounds). */
export function roofWallFaces(b: RoofBounds): {
    readonly x1: number;
    readonly x2: number;
    readonly z1: number;
    readonly z2: number;
} {
    if (b.wall) return b.wall;
    const ov = b.overhang ?? 0;
    return { x1: b.x1 + ov, x2: b.x2 - ov, z1: b.z1 + ov, z2: b.z2 - ov };
}
