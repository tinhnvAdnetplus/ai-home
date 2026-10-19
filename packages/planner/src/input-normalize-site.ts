import { clampNum, resolveRoadSide } from './input-presets.js';

export function normalizeSiteFields(rec: Record<string, unknown>): {
    frontage: number;
    landDepth: number;
    landAreaTsubo: number;
    roadSide: '北' | '東' | '南' | '西';
    landShape: '正方形' | '長方形' | '変形';
    surroundings: readonly string[] | undefined;
} {
    const frontage = clampNum(rec['site.frontage'] ?? rec.frontage, 4, 40, 12);
    const landDepth = clampNum(
        rec['site.depth'] ?? rec.landDepth ?? rec.depth,
        4,
        60,
        14,
    );
    const landAreaTsubo = clampNum(
        rec['site.landAreaTsubo'] ??
            rec.landAreaTsubo ??
            rec.land_area ??
            rec.landTsubo ??
            rec.landArea,
        15,
        300,
        50,
    );
    const roadSide = resolveRoadSide(rec['site.roadSide'] ?? rec.roadSide);
    const landShape: '正方形' | '長方形' | '変形' =
        rec['site.landShape'] === '正方形' || rec['site.landShape'] === '変形'
            ? rec['site.landShape']
            : rec.landShape === '正方形' ||
                rec.landShape === '変形' ||
                rec.land_shape === 'square'
              ? '正方形'
              : rec.landShape === '変形' || rec.land_shape === 'irregular'
                ? '変形'
                : '長方形';
    const surroundings = Array.isArray(rec.surroundings)
        ? rec.surroundings.filter((x): x is string => typeof x === 'string')
        : undefined;

    return {
        frontage,
        landDepth,
        landAreaTsubo,
        roadSide,
        landShape,
        surroundings,
    };
}
