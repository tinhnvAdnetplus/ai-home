import { type BdmIssue } from '@aihome/bdm';

export type ScalerInput = {
    readonly targetAreaTsubo: number;
    readonly floors: 1 | 2;
    readonly ldkJo: number;
    readonly masterJo: number;
    readonly kidsRooms: number;
    readonly kidsJo: number;
    readonly tatamiJo?: number | undefined;
    readonly hasStudy?: boolean | undefined;
    readonly hasLaundry?: boolean | undefined;
    readonly hasPantry?: boolean | undefined;
    readonly hasFamCloset?: boolean | undefined;
    readonly hasWash2?: boolean | undefined;
    readonly cellM2: number;
};

export type ScaledRooms = {
    readonly ldkJo: number;
    readonly masterJo: number;
    readonly kidsJo: number;
    readonly tatamiJo?: number | undefined;
    readonly shouldDropStudy?: boolean | undefined;
    readonly shouldDropLaundry?: boolean | undefined;
    readonly shouldDropPantry?: boolean | undefined;
    readonly shouldDropFamCloset?: boolean | undefined;
    readonly shouldDropWash2?: boolean | undefined;
    readonly warnings: readonly BdmIssue[];
};
