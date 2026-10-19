export type PlannerConfig = {
    readonly gridMm: number;
    readonly cellM2: number;
    readonly proposalsCount: number;
    readonly defaultCoverageLimit: number;
    readonly defaultFloorRatioLimit: number;
    readonly defaultSetbackFrontMm: number;
    readonly defaultSetbackSideMm: number;
    readonly defaultSetbackRearMm: number;
    readonly defaultWallThicknessExtMm: number;
    readonly defaultWallThicknessIntMm: number;
    readonly scoringWeights: {
        readonly houseworkPriorityMultiplier: number;
        readonly storagePriorityMultiplier: number;
        readonly daylightPriorityMultiplier: number;
        readonly budgetWeight: number;
    };
    readonly unitPricePerTsubo: {
        readonly standard: number;
        readonly highGrade: number;
        readonly premium: number;
    };
    readonly structureCoefficients: Record<string, number>;
    readonly roofCoefficients: Record<string, number>;
};

export const defaultPlannerConfig: PlannerConfig = {
    gridMm: 910,
    cellM2: 0.8281,
    proposalsCount: 3,
    defaultCoverageLimit: 60,
    defaultFloorRatioLimit: 200,
    defaultSetbackFrontMm: 1000,
    defaultSetbackSideMm: 500,
    defaultSetbackRearMm: 1400,
    defaultWallThicknessExtMm: 150,
    defaultWallThicknessIntMm: 100,
    scoringWeights: {
        houseworkPriorityMultiplier: 1.6,
        storagePriorityMultiplier: 1.6,
        daylightPriorityMultiplier: 1.6,
        budgetWeight: 1.2,
    },
    unitPricePerTsubo: {
        standard: 78,
        highGrade: 95,
        premium: 115,
    },
    structureCoefficients: {
        木造軸組: 1.0,
        '2×4': 1.02,
        鉄骨造: 1.18,
        RC造: 1.38,
    },
    roofCoefficients: {
        切妻: 1.0,
        寄棟: 1.03,
        片流れ: 0.99,
        陸屋根: 1.05,
    },
};
