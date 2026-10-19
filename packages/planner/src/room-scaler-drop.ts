import { type BdmIssue } from '@aihome/bdm';
import { type ScalerInput } from './room-scaler-types.js';

const MIN_TATAMI_JO = 3;

export type DroppedRoomsState = {
    shouldDropStudy: boolean;
    shouldDropWash2: boolean;
    shouldDropFamCloset: boolean;
    shouldDropLaundry: boolean;
    shouldDropPantry: boolean;
    tatamiJo: number | undefined;
    warnings: BdmIssue[];
};

export function dropOptionalRooms(
    input: ScalerInput,
    maxAllowableCells: number,
    fixedCells: number,
    ldkJo: number,
    masterJo: number,
    kidsJo: number,
): DroppedRoomsState {
    let tatamiJo = input.tatamiJo;
    let shouldDropStudy = false;
    let shouldDropWash2 = false;
    let shouldDropFamCloset = false;
    let shouldDropLaundry = false;
    let shouldDropPantry = false;
    const warnings: BdmIssue[] = [];

    const calcTotal = (): number => {
        const cLdk = Math.round(ldkJo * 2);
        const cMaster = Math.round(masterJo * 2);
        const cKids = input.kidsRooms * Math.round(kidsJo * 2);
        const cTatami = tatamiJo ? Math.round(tatamiJo * 2) : 0;
        const cStudy = input.hasStudy && !shouldDropStudy ? 4 : 0;
        const cWash2 = input.hasWash2 && !shouldDropWash2 ? 2 : 0;
        const cFam = input.hasFamCloset && !shouldDropFamCloset ? 4 : 0;
        const cLaundry = input.hasLaundry && !shouldDropLaundry ? 4 : 0;
        const cPantry = input.hasPantry && !shouldDropPantry ? 2 : 0;
        return (
            fixedCells +
            cLdk +
            cMaster +
            cKids +
            cTatami +
            cStudy +
            cWash2 +
            cFam +
            cLaundry +
            cPantry
        );
    };

    if (calcTotal() > maxAllowableCells && input.hasStudy) {
        shouldDropStudy = true;
        warnings.push({
            path: ['rooms', 'study'],
            code: 'ROOM_DROPPED:study',
            message: '延床面積の制約により書斎を省略しました。',
            level: 'warn',
        });
    }
    if (calcTotal() > maxAllowableCells && input.hasWash2) {
        shouldDropWash2 = true;
        warnings.push({
            path: ['rooms', 'wash2'],
            code: 'ROOM_DROPPED:wash2',
            message: '延床面積の制約により2階洗面を省略しました。',
            level: 'warn',
        });
    }
    if (calcTotal() > maxAllowableCells && input.hasFamCloset) {
        shouldDropFamCloset = true;
        warnings.push({
            path: ['rooms', 'famcloset'],
            code: 'ROOM_DROPPED:family_closet',
            message:
                '延床面積の制約によりファミリークローゼットを省略しました。',
            level: 'warn',
        });
    }
    if (calcTotal() > maxAllowableCells && input.hasLaundry) {
        shouldDropLaundry = true;
        warnings.push({
            path: ['rooms', 'laundry'],
            code: 'ROOM_DROPPED:laundry',
            message: '延床面積の制約によりランドリールームを省略しました。',
            level: 'warn',
        });
    }
    if (calcTotal() > maxAllowableCells && input.hasPantry) {
        shouldDropPantry = true;
        warnings.push({
            path: ['rooms', 'pantry'],
            code: 'ROOM_DROPPED:pantry',
            message: '延床面積の制約によりパントリーを省略しました。',
            level: 'warn',
        });
    }
    if (calcTotal() > maxAllowableCells && tatamiJo !== undefined) {
        if (tatamiJo > MIN_TATAMI_JO) {
            tatamiJo = MIN_TATAMI_JO;
            warnings.push({
                path: ['rooms', 'washitsu'],
                code: 'ROOM_SIZE_REDUCED:washitsu',
                message: '延床面積の制約により和室を3帖に縮小しました。',
                level: 'warn',
            });
        }
        if (calcTotal() > maxAllowableCells) {
            tatamiJo = undefined;
            warnings.push({
                path: ['rooms', 'washitsu'],
                code: 'ROOM_DROPPED:washitsu',
                message: '延床面積の制約により和室を省略しました。',
                level: 'warn',
            });
        }
    }

    return {
        shouldDropStudy,
        shouldDropWash2,
        shouldDropFamCloset,
        shouldDropLaundry,
        shouldDropPantry,
        tatamiJo,
        warnings,
    };
}
