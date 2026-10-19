/**
 * Answer update handlers for AI refinement.
 */
export {
    type RefineChipKey,
    type RefineChipDef,
    REFINE_CHIP_LIST,
} from './plan-refine-chip-defs';

function addToArray(arr: unknown, item: string): readonly string[] {
    const list: string[] = Array.isArray(arr)
        ? arr.filter((x): x is string => typeof x === 'string')
        : [];
    if (!list.includes(item)) {
        list.push(item);
    }
    return list;
}

export function applyRefineChip(
    chipId: string,
    currentAnswers: Record<string, unknown>,
): { readonly updatedAnswers: Record<string, unknown>; readonly log: string } {
    const next: Record<string, unknown> = { ...currentAnswers };
    let log = '';

    switch (chipId) {
        case 'island':
            next.kitchenType = 'アイランド';
            next.plan_kitchen = 'island';
            next['rooms.kitchenType'] = 'island';
            log = 'キッチンをアイランド型に変更';
            break;
        case 'kids+': {
            const currentSize =
                typeof next.kidsSize === 'number' ? next.kidsSize : 6;
            const newSize = Math.min(10, currentSize + 1);
            next.kidsSize = newSize;
            next.plan_kids_room_size = `size_${newSize.toString()}`;
            log = `子ども部屋を${newSize.toString()}帖に拡大`;
            break;
        }
        case 'storage+':
            next.storageLevel = '大容量希望';
            next.plan_storage = addToArray(next.plan_storage, 'walkin_closet');
            next.plan_storage = addToArray(next.plan_storage, 'shoes_cloak');
            next.waterOpts = addToArray(next.waterOpts, 'パントリー');
            log = '収納を大容量希望に変更（WIC・SIC・パントリー）';
            break;
        case 'ldk20':
            next.ldkSize = 20;
            next.plan_ldk_size = 'size_20';
            log = 'LDKを20帖に設定';
            break;
        case 'deck':
            next.outdoorOpts = addToArray(next.outdoorOpts, 'ウッドデッキ');
            next.design_features = addToArray(
                next.design_features,
                'wood_deck',
            );
            log = 'ウッドデッキを追加';
            break;
        case 'cheaper': {
            next.grade = 'スタンダード';
            const curTarget =
                typeof next.targetArea === 'number' ? next.targetArea : 32;
            const newTarget = Math.max(18, curTarget - 3);
            next.targetArea = newTarget;
            next.plan_target_area = newTarget;
            log = `仕様をスタンダードにし延床を${newTarget.toString()}坪に調整`;
            break;
        }
        case 'compact': {
            const curTarget =
                typeof next.targetArea === 'number' ? next.targetArea : 32;
            const newTarget = Math.max(18, curTarget - 2);
            next.targetArea = newTarget;
            next.plan_target_area = newTarget;
            const curLdk = typeof next.ldkSize === 'number' ? next.ldkSize : 18;
            const nextLdk = Math.max(12, curLdk - 1);
            next.ldkSize = nextLdk;
            log = `延床を${newTarget.toString()}坪、LDKを${nextLdk.toString()}帖に調整`;
            break;
        }
        case 'hiraya':
            next.floors = 1;
            next.plan_type = 'one_story';
            next['building.floors'] = 'one_story';
            log = '平屋（1階建）に変更';
            break;
        case 'void':
            next.extraRooms = addToArray(next.extraRooms, '吹き抜け');
            next.life_spaces = addToArray(next.life_spaces, 'fukinuke');
            log = '吹き抜けを追加';
            break;
        case 'study':
            next.extraRooms = addToArray(next.extraRooms, '書斎');
            next.wfh = '書斎が必要';
            next.plan_study_count = 'count_1';
            log = '書斎を追加';
            break;
        case 'wc2':
            next.toilets = 2;
            next.plan_toilet = 'two_floors';
            log = 'トイレを2カ所に変更';
            break;
        case 'laundry':
            next.waterOpts = addToArray(next.waterOpts, 'ランドリールーム');
            next.life_flow = addToArray(next.life_flow, 'short_laundry_flow');
            log = 'ランドリールームを追加';
            break;
        default:
            log = '条件を調整';
            break;
    }

    return { updatedAnswers: next, log };
}
