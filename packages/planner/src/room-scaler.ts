import { type BdmIssue } from '@aihome/bdm';
import { type ScalerInput, type ScaledRooms } from './room-scaler-types.js';
import { dropOptionalRooms } from './room-scaler-drop.js';

export type { ScalerInput, ScaledRooms } from './room-scaler-types.js';

const MIN_LDK_JO = 10;
const MIN_MASTER_JO = 6;
const MIN_KIDS_JO = 4.5;

export function scaleRoomSizes(input: ScalerInput): ScaledRooms {
    const targetM2 = input.targetAreaTsubo * 3.3058;
    const targetCells = Math.round(targetM2 / input.cellM2);
    const maxAllowableCells = Math.round(targetCells * 1.08);
    const fixedCells = input.floors === 2 ? 26 : 14;

    let ldkJo = input.ldkJo;
    let masterJo = input.masterJo;
    let kidsJo = input.kidsJo;

    const dropped = dropOptionalRooms(
        input,
        maxAllowableCells,
        fixedCells,
        ldkJo,
        masterJo,
        kidsJo,
    );
    const warnings: BdmIssue[] = [...dropped.warnings];
    const tatamiJo = dropped.tatamiJo;

    const calcTotal = (): number => {
        const cLdk = Math.round(ldkJo * 2);
        const cMaster = Math.round(masterJo * 2);
        const cKids = input.kidsRooms * Math.round(kidsJo * 2);
        const cTatami = tatamiJo ? Math.round(tatamiJo * 2) : 0;
        const cStudy = input.hasStudy && !dropped.shouldDropStudy ? 4 : 0;
        const cWash2 = input.hasWash2 && !dropped.shouldDropWash2 ? 2 : 0;
        const cFam = input.hasFamCloset && !dropped.shouldDropFamCloset ? 4 : 0;
        const cLaundry = input.hasLaundry && !dropped.shouldDropLaundry ? 4 : 0;
        const cPantry = input.hasPantry && !dropped.shouldDropPantry ? 2 : 0;
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

    if (calcTotal() > maxAllowableCells) {
        const extraCells =
            (input.hasStudy && !dropped.shouldDropStudy ? 4 : 0) +
            (input.hasWash2 && !dropped.shouldDropWash2 ? 2 : 0) +
            (input.hasFamCloset && !dropped.shouldDropFamCloset ? 4 : 0) +
            (input.hasLaundry && !dropped.shouldDropLaundry ? 4 : 0) +
            (input.hasPantry && !dropped.shouldDropPantry ? 2 : 0);
        const availForCore = Math.max(
            30,
            maxAllowableCells - fixedCells - extraCells,
        );
        const reqCore =
            Math.round(ldkJo * 2) +
            Math.round(masterJo * 2) +
            input.kidsRooms * Math.round(kidsJo * 2);
        const scale = availForCore / reqCore;

        const newLdk = Math.max(
            MIN_LDK_JO,
            Math.round(input.ldkJo * scale * 2) / 2,
        );
        const newMaster = Math.max(
            MIN_MASTER_JO,
            Math.round(input.masterJo * scale * 2) / 2,
        );
        const newKids = Math.max(
            MIN_KIDS_JO,
            Math.round(input.kidsJo * scale * 2) / 2,
        );

        if (newLdk < ldkJo) {
            ldkJo = newLdk;
            warnings.push({
                path: ['rooms', 'ldk'],
                code: 'ROOM_SIZE_REDUCED:ldk',
                message: `延床面積の制約によりLDKをご希望の ${input.ldkJo.toString()} 帖から ${ldkJo.toString()} 帖に調整しました。`,
                level: 'warn',
            });
        }
        if (newMaster < masterJo) {
            masterJo = newMaster;
            warnings.push({
                path: ['rooms', 'master'],
                code: 'ROOM_SIZE_REDUCED:master',
                message: `延床面積の制約により主寝室をご希望の ${input.masterJo.toString()} 帖から ${masterJo.toString()} 帖に調整しました。`,
                level: 'warn',
            });
        }
        if (input.kidsRooms > 0 && newKids < kidsJo) {
            kidsJo = newKids;
            warnings.push({
                path: ['rooms', 'kids'],
                code: 'ROOM_SIZE_REDUCED:kids',
                message: `延床面積の制約により子ども部屋をご希望の ${input.kidsJo.toString()} 帖から ${kidsJo.toString()} 帖に調整しました。`,
                level: 'warn',
            });
        }
    }

    const minFeasible =
        fixedCells +
        Math.round(MIN_LDK_JO * 2) +
        Math.round(MIN_MASTER_JO * 2) +
        input.kidsRooms * Math.round(MIN_KIDS_JO * 2);
    if (minFeasible > maxAllowableCells) {
        warnings.push({
            path: ['floor_area'],
            code: 'TOTAL_AREA_DEVIATION',
            message:
                'ご希望の部屋構成（LDK・寝室・子ども部屋）を最小寸法で確保した場合でも、延床面積が目標坪数を上回ります。',
            level: 'warn',
        });
    }

    return {
        ldkJo,
        masterJo,
        kidsJo,
        tatamiJo,
        shouldDropStudy: dropped.shouldDropStudy,
        shouldDropLaundry: dropped.shouldDropLaundry,
        shouldDropPantry: dropped.shouldDropPantry,
        shouldDropFamCloset: dropped.shouldDropFamCloset,
        shouldDropWash2: dropped.shouldDropWash2,
        warnings,
    };
}
