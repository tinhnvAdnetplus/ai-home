import {
    safeGetFirst,
    safeGetString,
    safeGetStringArray,
} from './answers-readers.js';
import { parseNumericUnit, m2ToTsubo } from './answers-units.js';
import { ROAD_SIDE_TABLE, LAND_SHAPE_TABLE } from './answers-tables.js';
import { type Issue } from './answers-types.js';

export function mapSiteAnswers(
    rec: Record<string, unknown>,
    issues: Issue[],
): {
    frontage: number;
    landDepth: number;
    landAreaTsubo: number;
    roadSide: '北' | '東' | '南' | '西';
    landShape: '正方形' | '長方形' | '変形';
    surroundings: readonly string[];
} {
    const rawFrontage = safeGetFirst(rec, ['site.frontage', 'frontage']);
    const parsedFrontage = parseNumericUnit(rawFrontage);
    const frontage = Math.min(60, Math.max(4, parsedFrontage?.value ?? 12));
    if (parsedFrontage === undefined) {
        issues.push({
            path: ['frontage'],
            code: 'DEFAULT_APPLIED',
            message: 'Frontage defaulted to 12m',
            level: 'info',
        });
    }

    const rawDepth = safeGetFirst(rec, ['site.depth', 'depth', 'landDepth']);
    const parsedDepth = parseNumericUnit(rawDepth);
    const landDepth = Math.min(80, Math.max(4, parsedDepth?.value ?? 14));
    if (parsedDepth === undefined) {
        issues.push({
            path: ['landDepth'],
            code: 'DEFAULT_APPLIED',
            message: 'Depth defaulted to 14m',
            level: 'info',
        });
    }

    const rawArea = safeGetFirst(rec, [
        'site.landAreaTsubo',
        'land_area',
        'landAreaTsubo',
        'landTsubo',
    ]);
    const parsedArea = parseNumericUnit(rawArea);
    let areaVal = 50;
    if (parsedArea !== undefined) {
        areaVal =
            parsedArea.unit === 'm2'
                ? m2ToTsubo(parsedArea.value)
                : parsedArea.value;
    } else {
        areaVal = Math.round(((frontage * landDepth) / 3.305785) * 10) / 10;
        issues.push({
            path: ['landAreaTsubo'],
            code: 'ESTIMATED_FROM_DIMENSIONS',
            message: `Estimated land area: ${String(areaVal)} tsubo`,
            level: 'info',
        });
    }
    const landAreaTsubo = Math.min(500, Math.max(10, areaVal));

    const rawRoad = safeGetString(
        rec,
        ['site.roadSide', 'road_side', 'roadSide'],
        'south',
    );
    const roadSide = ROAD_SIDE_TABLE[rawRoad] ?? '南';

    const rawShape = safeGetString(
        rec,
        ['site.landShape', 'land_shape', 'landShape'],
        'rectangle',
    );
    const landShape = LAND_SHAPE_TABLE[rawShape] ?? '長方形';

    const rawSurr = safeGetStringArray(rec, [
        'site.surroundings',
        'surroundings',
    ]);
    const surroundings = rawSurr.length > 0 ? rawSurr : ['住宅地'];

    return {
        frontage,
        landDepth,
        landAreaTsubo,
        roadSide,
        landShape,
        surroundings,
    };
}
