import { type PlanInput } from './types.js';
import {
    STORAGE_PRESETS,
    DEFAULT_STORAGE_PRESET,
    isRecord,
    clampNum,
    getString,
    getStringArray,
    resolveBathSize,
} from './input-presets.js';
import { normalizeRoomOptions } from './input-normalize-rooms.js';
import { normalizeSiteFields } from './input-normalize-site.js';

export function normalizePlanInput(raw: unknown): PlanInput {
    const rec = isRecord(raw) ? raw : {};
    const site = normalizeSiteFields(rec);
    const floorsVal = clampNum(rec['building.floors'] ?? rec.floors, 1, 2, 2);

    const storageLevel = getString(
        rec['rooms.storageLevel'] ?? rec.storageLevel,
        '標準',
    );
    const preset = STORAGE_PRESETS[storageLevel] ?? DEFAULT_STORAGE_PRESET;

    const roomTypes = getStringArray(
        rec['rooms.roomTypes'] ?? rec.roomTypes,
        [],
    );
    const mustHave = getStringArray(
        rec['priorities.mustHave'] ?? rec.mustHave,
        [],
    );
    const notNeeded = getStringArray(
        rec['priorities.notNeeded'] ?? rec.notNeeded,
        [],
    );
    const wfh = getString(rec['rooms.wfh'] ?? rec.wfh, 'なし');

    const roomOpts = normalizeRoomOptions(
        rec,
        preset,
        storageLevel,
        roomTypes,
        mustHave,
        notNeeded,
        wfh,
    );

    return {
        frontage: site.frontage,
        landDepth: site.landDepth,
        landAreaTsubo: site.landAreaTsubo,
        roadSide: site.roadSide,
        landShape: site.landShape,
        surroundings: site.surroundings,
        adults: typeof rec.adults === 'number' ? rec.adults : undefined,
        children: typeof rec.children === 'number' ? rec.children : undefined,
        twoGen: typeof rec.twoGen === 'string' ? rec.twoGen : undefined,
        targetArea: clampNum(
            rec['building.targetArea'] ?? rec.targetArea,
            18,
            70,
            35,
        ),
        floors: floorsVal === 1 ? 1 : 2,
        ldkSize: clampNum(rec['building.ldkSize'] ?? rec.ldkSize, 12, 30, 18),
        masterSize: clampNum(
            rec['building.masterSize'] ?? rec.masterSize,
            6,
            12,
            8,
        ),
        kidsRooms: clampNum(
            rec['building.kidsRooms'] ?? rec.kidsRooms,
            0,
            4,
            2,
        ),
        kidsSize: clampNum(rec['building.kidsSize'] ?? rec.kidsSize, 4.5, 8, 6),
        toilets: clampNum(rec['rooms.toilets'] ?? rec.toilets, 1, 3, 2),
        bathSize: resolveBathSize(rec['rooms.bathSize'] ?? rec.bathSize),
        bathFloor:
            (rec['rooms.bathFloor'] ?? rec.bathFloor) === '2階' ? '2階' : '1階',
        washCount: clampNum(rec['rooms.washCount'] ?? rec.washCount, 1, 2, 1),
        waterOpts: roomOpts.waterOpts,
        tatamiRoom: roomOpts.tatamiRoom,
        storageLevel,
        wfh,
        roomTypes:
            roomTypes.length > 0 ? roomTypes : ['LDK', '寝室', '子ども部屋'],
        exteriorStyle: getString(
            rec['design.exteriorStyle'] ?? rec.exteriorStyle,
            'モダン',
        ),
        roofType: getString(rec['design.roofType'] ?? rec.roofType, '切妻'),
        interiorStyle: getString(
            rec['design.interiorStyle'] ?? rec.interiorStyle,
            '木目ナチュラル',
        ),
        priorities: getStringArray(
            rec['priorities.priorities'] ?? rec.priorities,
            ['家事動線', '収納量'],
        ),
        mustHave,
        notNeeded,
        budget: clampNum(rec['budget.total'] ?? rec.budget, 1500, 9000, 3500),
        budgetScope: getString(
            rec['budget.scope'] ?? rec.budgetScope,
            '建物のみ',
        ),
        cars: clampNum(rec['parking.cars'] ?? rec.cars, 0, 4, 2),
        parkingType: getString(
            rec['parking.type'] ?? rec.parkingType ?? rec.parking,
            'カーポート',
        ),
        evCharger: roomOpts.evCharger,
        insulation: getString(
            rec['performance.insulation'] ?? rec.insulation,
            '等級6',
        ),
        seismic: getString(rec['performance.seismic'] ?? rec.seismic, '等級3'),
        solar: roomOpts.solar,
        coverageLimit: clampNum(rec.coverage ?? rec.coverageLimit, 30, 80, 60),
        floorRatioLimit: clampNum(
            rec.floorRatio ?? rec.floorRatioLimit,
            50,
            300,
            200,
        ),
        masterCloset: getString(
            rec['rooms.masterCloset'] ?? rec.masterCloset,
            preset.masterCloset,
        ),
        kidsCloset: getString(
            rec['rooms.kidsCloset'] ?? rec.kidsCloset,
            preset.kidsCloset,
        ),
        shoesCloset: roomOpts.shoesCloset,
        storageOpts: roomOpts.storageOpts,
        extraRooms: roomOpts.extraRooms,
        outdoorOpts: roomOpts.outdoorOpts,
        equipOpts: roomOpts.equipOpts,
        kitchenType: roomOpts.kitchenType,
    };
}
