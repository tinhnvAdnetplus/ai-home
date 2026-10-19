export type StoragePreset = {
    readonly masterCloset: string;
    readonly kidsCloset: string;
    readonly shoesCloset: string;
    readonly storageOpts: readonly string[];
};

export const DEFAULT_STORAGE_PRESET: StoragePreset = {
    masterCloset: 'ウォークイン',
    kidsCloset: 'クローゼット',
    shoesCloset: '収納型',
    storageOpts: ['階段下収納'],
};

export const STORAGE_PRESETS: Record<string, StoragePreset> = {
    最小限: {
        masterCloset: 'クローゼット',
        kidsCloset: 'クローゼット',
        shoesCloset: 'なし',
        storageOpts: ['階段下収納'],
    },
    標準: DEFAULT_STORAGE_PRESET,
    大容量希望: {
        masterCloset: 'ウォークイン',
        kidsCloset: 'ウォークイン',
        shoesCloset: 'ウォークスルー',
        storageOpts: [
            'ファミリークローゼット',
            '納戸',
            '階段下収納',
            '小屋裏収納',
        ],
    },
};

export const EXTRA_ROOM_KEYS = [
    '書斎',
    '客間',
    '趣味室',
    '土間収納',
    '吹き抜け',
    'ホームエレベーター',
] as const;

export function addUnique(
    arr: readonly string[],
    item: string,
): readonly string[] {
    return arr.includes(item) ? arr : [...arr, item];
}

export function removeUnique(
    arr: readonly string[],
    item: string,
): readonly string[] {
    return arr.filter((x) => x !== item);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function clampNum(
    val: unknown,
    min: number,
    max: number,
    def: number,
): number {
    const num = Number(val);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
        return def;
    }
    return Math.min(max, Math.max(min, num));
}

export function getString(val: unknown, def: string): string {
    return typeof val === 'string' && val.length > 0 ? val : def;
}

export function getStringArray(
    val: unknown,
    def: readonly string[],
): readonly string[] {
    if (!Array.isArray(val)) return def;
    return val.filter((x): x is string => typeof x === 'string');
}

export function resolveRoadSide(val: unknown): '北' | '東' | '南' | '西' {
    if (val === '北' || val === 'north') return '北';
    if (val === '東' || val === 'east') return '東';
    if (val === '西' || val === 'west') return '西';
    return '南';
}

export function resolveBathSize(val: unknown): '1坪' | '1.25坪' | '1.5坪' {
    if (val === '1.25坪' || val === '1.5坪') return val;
    return '1坪';
}
