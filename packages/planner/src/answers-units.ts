export const TSUBO_IN_M2 = 3.305785;

export function m2ToTsubo(m2: number): number {
    if (!Number.isFinite(m2) || m2 <= 0) return 0;
    return Math.round((m2 / TSUBO_IN_M2) * 100) / 100;
}

export function tsuboToM2(tsubo: number): number {
    if (!Number.isFinite(tsubo) || tsubo <= 0) return 0;
    return Math.round(tsubo * TSUBO_IN_M2 * 100) / 100;
}

export type ParsedNumericUnit = {
    readonly value: number;
    readonly unit: 'tsubo' | 'm2' | 'meter' | 'unknown';
};

export function parseNumericUnit(raw: unknown): ParsedNumericUnit | undefined {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return { value: raw, unit: 'unknown' };
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.length === 0) return undefined;

        if (trimmed.endsWith('坪')) {
            const num = Number(trimmed.slice(0, -1).trim());
            return Number.isFinite(num)
                ? { value: num, unit: 'tsubo' }
                : undefined;
        }
        if (
            trimmed.endsWith('㎡') ||
            trimmed.endsWith('m²') ||
            trimmed.endsWith('m2')
        ) {
            const num = Number(trimmed.replace(/(㎡|m²|m2)$/, '').trim());
            return Number.isFinite(num)
                ? { value: num, unit: 'm2' }
                : undefined;
        }
        if (trimmed.endsWith('m') || trimmed.endsWith('ｍ')) {
            const num = Number(trimmed.replace(/(m|ｍ)$/, '').trim());
            return Number.isFinite(num)
                ? { value: num, unit: 'meter' }
                : undefined;
        }
        const num = Number(trimmed);
        return Number.isFinite(num)
            ? { value: num, unit: 'unknown' }
            : undefined;
    }
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        const val = 'value' in raw ? Number(raw.value) : NaN;
        if (!Number.isFinite(val)) return undefined;
        const unitRaw = 'unit' in raw ? raw.unit : undefined;
        const u = typeof unitRaw === 'string' ? unitRaw.toLowerCase() : '';
        if (u === '坪' || u === 'tsubo') return { value: val, unit: 'tsubo' };
        if (u === '㎡' || u === 'm²' || u === 'm2')
            return { value: val, unit: 'm2' };
        if (u === 'm' || u === 'meter') return { value: val, unit: 'meter' };
        return { value: val, unit: 'unknown' };
    }
    return undefined;
}
