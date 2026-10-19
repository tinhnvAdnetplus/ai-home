// Allow-lists and data parity rules for i18n audit
export const ALLOW_B = new Set([
    '日本語',
    '和室',
    '畳',
    '帖',
    '坪',
    '土間',
    '床の間',
    'LDK',
]);

export const ALLOW_D = new Set([
    'AI HOME',
    'AI HOME PLATFORM',
    '3D',
    '2D',
    'CAD',
    'DXF',
    'IFC',
    'LDK',
    'STEP',
    'STEP 1',
    'STEP 2',
    'STEP 3',
    'STEP 4',
    'STEP 5',
    'PDF',
    'JPEG',
    'PNG',
    'JSON',
    'UTC',
    'MySQL',
    'Gemini',
    'Claude',
]);

export const flatten = (obj, p = '') =>
    Object.entries(obj).reduce((acc, [k, v]) => {
        const key = p ? `${p}.${k}` : k;
        return v && typeof v === 'object' && !Array.isArray(v)
            ? Object.assign(acc, flatten(v, key))
            : Object.assign(acc, { [key]: v });
    }, {});

export function checkParity(jaKeys, enKeys, viKeys) {
    const diff = (from, to, type) =>
        [...from]
            .filter((k) => !to.has(k))
            .map((k) => ({ type, ns: k.split('.')[0], key: k }));
    return [
        ...diff(jaKeys, enKeys, 'missing_in_en'),
        ...diff(jaKeys, viKeys, 'missing_in_vi'),
        ...diff(enKeys, jaKeys, 'extra_in_en'),
        ...diff(viKeys, jaKeys, 'extra_in_vi'),
    ];
}

export function checkJapanese(enFlat, viFlat) {
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const find = (dict, lang) =>
        Object.entries(dict)
            .filter(
                ([k, v]) =>
                    typeof v === 'string' &&
                    jpRegex.test(v) &&
                    !ALLOW_B.has(v) &&
                    !ALLOW_B.has(k),
            )
            .map(([k, v]) => ({ lang, key: k, val: v }));
    return [...find(enFlat, 'en'), ...find(viFlat, 'vi')];
}
