import {
    type ProgramResult,
    type InternalPlanValues,
    type ProgramFlags,
} from './program-types.js';
import { buildFloor1Program } from './rooms-f1.js';
import { buildFloor2Program } from './rooms-f2.js';
import { scaleRoomSizes } from './room-scaler.js';

function has(arr: readonly string[] | undefined, v: string): boolean {
    return Array.isArray(arr) && arr.includes(v);
}

export function buildProgram(v: InternalPlanValues): ProgramResult {
    const isTwoFloor = v.floors >= 2;
    const tatamiJo =
        v.tatamiRoom && v.tatamiRoom !== 'なし'
            ? v.tatamiRoom.includes('6帖')
                ? 6
                : 4.5
            : undefined;
    const scaled = scaleRoomSizes({
        targetAreaTsubo: v.targetArea,
        floors: v.floors,
        ldkJo: v.ldkSize,
        masterJo: v.masterSize,
        kidsRooms: v.kidsRooms,
        kidsJo: v.kidsSize,
        tatamiJo,
        hasStudy: has(v.extraRooms, '書斎'),
        hasLaundry: has(v.waterOpts, 'ランドリールーム'),
        hasPantry: has(v.waterOpts, 'パントリー'),
        hasFamCloset: has(v.storageOpts, 'ファミリークローゼット'),
        hasWash2: has(v.waterOpts, '2階洗面'),
        cellM2: 0.8281,
    });

    const effWaterOpts = v.waterOpts?.filter((x) => {
        if (scaled.shouldDropLaundry && x === 'ランドリールーム') return false;
        if (scaled.shouldDropPantry && x === 'パントリー') return false;
        if (scaled.shouldDropWash2 && x === '2階洗面') return false;
        return true;
    });

    const effExtraRooms = v.extraRooms?.filter((x) => {
        if (scaled.shouldDropStudy && x === '書斎') return false;
        return true;
    });

    const effStorageOpts = v.storageOpts?.filter((x) => {
        if (scaled.shouldDropFamCloset && x === 'ファミリークローゼット')
            return false;
        return true;
    });

    const effV: InternalPlanValues = {
        ...v,
        ldkSize: scaled.ldkJo,
        masterSize: scaled.masterJo,
        kidsSize: scaled.kidsJo,
        tatamiRoom: scaled.tatamiJo !== undefined ? v.tatamiRoom : 'なし',
        waterOpts: effWaterOpts,
        extraRooms: effExtraRooms,
        storageOpts: effStorageOpts,
    };

    const { f1, need1 } = buildFloor1Program(effV);

    let f2 = null;
    let need2 = 0;
    if (isTwoFloor) {
        const f2Res = buildFloor2Program(effV);
        f2 = f2Res.f2;
        need2 = f2Res.need2;
    }

    const isVoid = has(v.extraRooms, '吹き抜け') && isTwoFloor;
    const isBalconyNotNeeded = has(v.notNeeded, 'バルコニー');
    const hasBalcony = isTwoFloor && !isBalconyNotNeeded;
    const isInnerBalcony = has(v.mustHave, 'インナーバルコニー');
    const balconyType = isInnerBalcony ? 'インナー' : '標準';

    const flags: ProgramFlags = {
        isVoid,
        isTwoFloor,
        hasBalcony,
        balconyType,
        isGarage: v.parkingType === 'ビルトイン',
        isCarport: v.parkingType === 'カーポート',
        hasDeck: has(v.outdoorOpts, 'ウッドデッキ'),
        hasGarden: has(v.outdoorOpts, '庭・植栽'),
        hasSolar: v.solar !== '不要',
        cars: v.cars,
        roofType: v.roofType ?? '切妻',
        style: v.exteriorStyle ?? 'モダン',
    };

    return {
        f1,
        f2,
        need1,
        need2,
        ldkJo: scaled.ldkJo,
        masterJo: scaled.masterJo,
        isTwoFloor,
        flags,
        warnings: scaled.warnings,
    };
}
