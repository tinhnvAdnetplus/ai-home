export type FootprintSizeParams = {
    readonly targetAreaTsubo: number;
    readonly floors: 1 | 2;
    readonly frontage: number;
    /** depth (m) between the front distance and the rear setback */
    readonly buildableDepth: number;
    readonly landAreaTsubo: number;
    readonly coverageLimit: number;
    readonly floorRatioLimit: number;
    readonly minW: number;
    readonly minD1: number;
    readonly minD2: number;
    readonly aspect: number;
    readonly cellM2: number;
};

export type SizedFootprint = {
    readonly W: number;
    readonly D1: number;
    readonly D2: number;
    readonly isConstrained: boolean;
};

export function sizeFootprint(p: FootprintSizeParams): SizedFootprint {
    const targetM2 = p.targetAreaTsubo * 3.3058;
    const targetTotalCells = Math.round(targetM2 / p.cellM2);

    const siteMaxW = Math.max(p.minW, Math.floor((p.frontage - 1.0) / 0.91));
    const siteMaxD = Math.max(p.minD1, Math.floor(p.buildableDepth / 0.91));

    const landM2 = p.landAreaTsubo * 3.305785;
    const maxCovCells = Math.floor(
        (landM2 * (p.coverageLimit / 100)) / p.cellM2,
    );
    const maxFarCells = Math.floor(
        (landM2 * (p.floorRatioLimit / 100)) / p.cellM2,
    );

    // Natural Japanese house aspect ratio (width / depth), around 0.95 to 1.15
    const desiredAspect = Math.max(0.85, Math.min(1.25, 1.05 * p.aspect));

    // Ideal width sized strictly from target area, NOT lot frontage!
    const targetCellsPerFloor =
        p.floors === 1 ? targetTotalCells : Math.round(targetTotalCells / 2);
    const idealW = Math.round(Math.sqrt(targetCellsPerFloor * desiredAspect));
    const idealD = Math.round(targetCellsPerFloor / Math.max(1, idealW));

    let bestW = p.minW;
    let bestD1 = p.minD1;
    let bestD2 = p.floors === 2 ? Math.min(p.minD1, p.minD2) : 0;
    let bestCost = Infinity;

    const startW = Math.max(p.minW, Math.min(siteMaxW, idealW - 2));
    const endW = Math.max(
        startW,
        Math.min(siteMaxW, Math.max(p.minW, idealW + 2)),
    );

    for (let w = startW; w <= endW; w++) {
        const startD1 = Math.max(p.minD1, Math.min(siteMaxD, idealD - 2));
        const endD1 = Math.max(startD1, Math.min(siteMaxD, idealD + 3));

        for (let d1 = startD1; d1 <= endD1; d1++) {
            if (w * d1 > maxCovCells) continue;

            if (p.floors === 1) {
                const totalCells = w * d1;
                if (totalCells > maxFarCells) continue;

                const areaDiff =
                    Math.abs(totalCells - targetTotalCells) / targetTotalCells;
                const aspectDiff = Math.abs(w / d1 - desiredAspect);
                const excessWidth = Math.max(0, w - idealW);
                const cost =
                    areaDiff * 10000 + aspectDiff * 25 + excessWidth * 15;

                if (cost < bestCost) {
                    bestCost = cost;
                    bestW = w;
                    bestD1 = d1;
                    bestD2 = 0;
                }
            } else {
                const minD2 = Math.min(d1, Math.max(p.minD2, d1 - 2));
                for (let d2 = minD2; d2 <= d1; d2++) {
                    const totalCells = w * d1 + w * d2;
                    if (totalCells > maxFarCells) continue;

                    const areaDiff =
                        Math.abs(totalCells - targetTotalCells) /
                        targetTotalCells;
                    const aspectDiff = Math.abs(w / d1 - desiredAspect);
                    const setbackCost = (d1 - d2) * 4;
                    const excessWidth = Math.max(0, w - idealW);
                    const cost =
                        areaDiff * 10000 +
                        aspectDiff * 25 +
                        setbackCost +
                        excessWidth * 15;

                    if (cost < bestCost) {
                        bestCost = cost;
                        bestW = w;
                        bestD1 = d1;
                        bestD2 = d2;
                    }
                }
            }
        }
    }

    const actualCells = bestW * bestD1 + (p.floors === 2 ? bestW * bestD2 : 0);
    const areaDevPct =
        Math.abs(actualCells - targetTotalCells) / targetTotalCells;
    const isConstrained = areaDevPct > 0.08;

    return { W: bestW, D1: bestD1, D2: bestD2, isConstrained };
}
