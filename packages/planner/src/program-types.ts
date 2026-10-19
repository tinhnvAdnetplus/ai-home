import { type BandSpec } from './grid-types.js';
import { type PlanInput } from './types.js';
import { type BdmIssue } from '@aihome/bdm';

export type ProgramFlags = {
    readonly isVoid: boolean;
    readonly isTwoFloor: boolean;
    readonly hasBalcony: boolean;
    readonly balconyType: string;
    readonly isGarage: boolean;
    readonly isCarport: boolean;
    readonly hasDeck: boolean;
    readonly hasGarden: boolean;
    readonly hasSolar: boolean;
    readonly cars: number;
    readonly roofType: string;
    readonly style: string;
};

export type ProgramResult = {
    f1: BandSpec[];
    f2: BandSpec[] | null;
    readonly need1: number;
    readonly need2: number;
    readonly ldkJo: number;
    readonly masterJo: number;
    readonly isTwoFloor: boolean;
    readonly flags: ProgramFlags;
    readonly warnings?: readonly BdmIssue[] | undefined;
};

export type InternalPlanValues = PlanInput & {
    readonly ldkFlex?: number | undefined;
    readonly extraRooms?: readonly string[] | undefined;
    readonly storageOpts?: readonly string[] | undefined;
    readonly outdoorOpts?: readonly string[] | undefined;
    readonly equipOpts?: readonly string[] | undefined;
    readonly shoesCloset?: string | undefined;
    readonly masterCloset?: string | undefined;
    readonly kidsCloset?: string | undefined;
    readonly parking?: string | undefined;
    readonly structure?: string | undefined;
    readonly grade?: string | undefined;
    readonly kitchenType?: string | undefined;
};
