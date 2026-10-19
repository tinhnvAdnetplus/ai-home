import { type PlanInput } from './types.js';
import { planInputSchema } from './input-schema.js';
import { isRecord } from './input-presets.js';
import { safeGetString } from './answers-readers.js';
import {
    FLOORS_TABLE,
    FAMILY_ADULTS_TABLE,
    FAMILY_CHILDREN_TABLE,
} from './answers-tables.js';
import { type Issue, type AnswersMappingResult } from './answers-types.js';
import {
    mapSiteAnswers,
    mapBuildingRoomsAnswers,
} from './answers-sub-mappers.js';
import {
    mapWetZoneAnswers,
    mapStorageAndWfhAnswers,
    mapDesignAndBudgetAnswers,
} from './answers-sub-amenities.js';

export function mapAnswersToPlanInput(
    answers: Record<string, unknown>,
): AnswersMappingResult {
    const issues: Issue[] = [];
    const raw: unknown = answers;
    const rec = isRecord(raw) ? answers : {};
    if (!isRecord(raw)) {
        issues.push({
            path: [],
            code: 'HOSTILE_INPUT_TYPE',
            message: 'Answers input is not a valid object; using defaults',
            level: 'warn',
        });
    }

    const rawFloors = safeGetString(
        rec,
        ['building.floors', 'plan_type', 'floors'],
        'two_story',
    );
    if (rawFloors === 'three_story') {
        issues.push({
            path: ['floors'],
            code: 'FLOORS_THREE_STORY_FALLBACK',
            message:
                '3-story layout not supported in procedural engine; defaulted to 2-story',
            level: 'info',
        });
    }
    const floors: 1 | 2 =
        FLOORS_TABLE[rawFloors] ?? (rawFloors === '1' ? 1 : 2);

    const site = mapSiteAnswers(rec, issues);
    const rooms = mapBuildingRoomsAnswers(rec, issues);
    const wet = mapWetZoneAnswers(rec, floors);
    const storage = mapStorageAndWfhAnswers(rec, floors);
    const design = mapDesignAndBudgetAnswers(rec);

    const rawAdults = safeGetString(
        rec,
        ['family.adults', 'family_adults'],
        'two',
    );
    const adults = Math.min(
        10,
        Math.max(1, FAMILY_ADULTS_TABLE[rawAdults] ?? 2),
    );

    const rawChildren = safeGetString(
        rec,
        ['family.children', 'family_children'],
        'two',
    );
    const children = Math.min(
        10,
        Math.max(0, FAMILY_CHILDREN_TABLE[rawChildren] ?? 2),
    );

    const inputCandidate: PlanInput = {
        frontage: site.frontage,
        landDepth: site.landDepth,
        landAreaTsubo: site.landAreaTsubo,
        roadSide: site.roadSide,
        landShape: site.landShape,
        surroundings: site.surroundings,
        adults,
        children,
        targetArea: rooms.targetArea,
        floors,
        ldkSize: rooms.ldkSize,
        masterSize: rooms.masterSize,
        kidsRooms: rooms.kidsRooms,
        kidsSize: rooms.kidsSize,
        tatamiRoom: rooms.tatamiRoom,
        toilets: wet.toilets,
        bathSize: wet.bathSize,
        bathFloor: wet.bathFloor,
        washCount: wet.washCount,
        waterOpts: wet.waterOpts,
        kitchenType: wet.kitchenType,
        storageLevel: storage.storageLevel,
        masterCloset: storage.masterCloset,
        kidsCloset: storage.kidsCloset,
        shoesCloset: storage.shoesCloset,
        storageOpts: storage.storageOpts,
        wfh: storage.wfh,
        extraRooms: storage.extraRooms,
        budget: design.budget,
        budgetScope: design.budgetScope,
        cars: design.cars,
        parkingType: design.parkingType,
        exteriorStyle: design.exteriorStyle,
        roofType: safeGetString(
            rec,
            ['design.roofType', 'roofType', 'roof_type'],
            '切妻',
        ),
        twoGen:
            safeGetString(
                rec,
                ['family.twoGen', 'twoGen', 'life_future'],
                '',
            ) === 'two_generation'
                ? 'あり'
                : undefined,
        interiorStyle: design.interiorStyle,
        priorities: design.priorities,
        outdoorOpts: design.outdoorOpts,
        coverageLimit: 60,
        floorRatioLimit: 200,
        insulation: '等級6',
        seismic: '等級3',
        solar: '希望',
    };

    const parsed = planInputSchema.safeParse(inputCandidate);
    if (!parsed.success) {
        for (const err of parsed.error.issues) {
            issues.push({
                path: err.path,
                code: 'SCHEMA_ADJUSTMENT',
                message: err.message,
                level: 'warn',
            });
        }
    }

    return { input: inputCandidate, issues };
}
