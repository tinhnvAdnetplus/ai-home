import {
    safeGetFirst,
    safeGetString,
    safeGetStringArray,
} from './answers-readers.js';
import { PARKING_COUNT_TABLE, BUDGET_RANGE_TABLE } from './answers-tables.js';

export function mapDesignAndBudgetAnswers(rec: Record<string, unknown>): {
    budget: number;
    budgetScope: string;
    cars: number;
    parkingType: string;
    exteriorStyle: string;
    interiorStyle: string;
    priorities: readonly string[];
    outdoorOpts: readonly string[];
} {
    const rawBudget = safeGetFirst(rec, [
        'budget.total',
        'budget_range',
        'budget',
    ]);
    let budget = 3500;
    if (typeof rawBudget === 'number' && Number.isFinite(rawBudget)) {
        budget = Math.min(20000, Math.max(500, rawBudget));
    } else if (typeof rawBudget === 'string') {
        budget = BUDGET_RANGE_TABLE[rawBudget] ?? 3500;
    }

    const rawCars = safeGetFirst(rec, [
        'parking.cars',
        'plan_parking_count',
        'cars',
    ]);
    let cars = 2;
    if (typeof rawCars === 'number' && Number.isFinite(rawCars)) {
        cars = Math.min(4, Math.max(0, rawCars));
    } else {
        const rawParking = typeof rawCars === 'string' ? rawCars : 'cars_2';
        cars = Math.min(4, Math.max(0, PARKING_COUNT_TABLE[rawParking] ?? 2));
    }

    const parkOpts = safeGetStringArray(rec, ['plan_parking_options']);
    const parkingType = parkOpts.includes('built_in')
        ? 'ビルトイン'
        : parkOpts.includes('carport')
          ? 'カーポート'
          : '青空';

    const rawExt = safeGetString(
        rec,
        [
            'design.exteriorStyle',
            'house_style',
            'design_exterior_style',
            'exteriorStyle',
        ],
        'modern',
    );
    const exteriorStyle = rawExt.includes('wa')
        ? '和モダン'
        : rawExt.includes('natural')
          ? 'ナチュラル'
          : rawExt.includes('western')
            ? '南欧風'
            : 'モダン';

    const rawInt = safeGetString(
        rec,
        ['design.interiorStyle', 'design_interior_style', 'interiorStyle'],
        'natural',
    );
    const interiorStyle = rawInt.includes('modern')
        ? 'モダン'
        : rawInt.includes('hotel')
          ? 'ホテルライク'
          : rawInt.includes('wa')
            ? '和モダン'
            : '木目ナチュラル';

    const rawPrio = safeGetStringArray(rec, [
        'priorities.priorities',
        'life_priorities',
    ]);
    const priorities = rawPrio.length > 0 ? rawPrio : ['家事動線', '収納量'];

    const designFeats = safeGetStringArray(rec, ['design_features']);
    const lifeSpaces = safeGetStringArray(rec, ['life_spaces']);
    const lifeParking = safeGetStringArray(rec, ['life_parking']);
    const outdoorOpts: string[] = [];
    if (designFeats.includes('wood_deck') || lifeSpaces.includes('deck_garden'))
        outdoorOpts.push('ウッドデッキ');
    if (lifeParking.includes('bicycle_space')) outdoorOpts.push('駐輪スペース');
    outdoorOpts.push('庭・植栽');

    return {
        budget,
        budgetScope: '建物のみ',
        cars,
        parkingType,
        exteriorStyle,
        interiorStyle,
        priorities,
        outdoorOpts,
    };
}
