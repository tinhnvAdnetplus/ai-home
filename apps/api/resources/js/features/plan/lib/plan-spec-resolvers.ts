import { type TFunction } from 'i18next';

export function resolveStructure(val: unknown, t: TFunction): string {
    if (val === '木造軸組' || val === 'wood') return t('plan:structureWood');
    if (val === '軽量鉄骨' || val === 'steel') return t('plan:structureSteel');
    if (val === 'RC' || val === 'rc') return t('plan:structureRc');
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return t('plan:structureWood');
}

export function resolveGrade(val: unknown, t: TFunction): string {
    if (val === 'スタンダード' || val === 'standard')
        return t('plan:gradeStandard');
    if (val === 'ハイグレード' || val === 'high') return t('plan:gradeHigh');
    if (val === 'プレミアム' || val === 'luxury') return t('plan:gradeLuxury');
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return t('plan:gradeStandard');
}

export function resolveInsulation(val: unknown, t: TFunction): string {
    if (val === '等級6' || val === 'grade6') return t('plan:insulationGrade6');
    if (val === '等級5' || val === 'grade5') return t('plan:insulationGrade5');
    if (val === '等級7' || val === 'grade7') return t('plan:insulationGrade7');
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return t('plan:insulationGrade6');
}

export function resolveSeismic(val: unknown, t: TFunction): string {
    if (val === '等級3' || val === 'grade3') return t('plan:seismicGrade3');
    if (val === '等級2' || val === 'grade2') return t('plan:seismicGrade2');
    if (val === '等級1' || val === 'grade1') return t('plan:seismicGrade1');
    if (typeof val === 'string' && val.trim().length > 0) return val;
    return t('plan:seismicGrade3');
}

export function resolveRoof(
    val: unknown,
    fallback: string,
    t: TFunction,
): string {
    const key = typeof val === 'string' && val.length > 0 ? val : fallback;
    if (key === '切妻' || key === 'gable' || key === 'gabled')
        return t('plan:roofGable');
    if (key === '寄棟' || key === 'hip' || key === 'hipped')
        return t('plan:roofHip');
    if (key === '陸屋根' || key === 'flat') return t('plan:roofFlat');
    if (key === '片流れ' || key === 'shed') return t('plan:roofShed');
    return key;
}
