import { type InternalPlanValues } from './program-types.js';
import { type NarrowOptions } from './narrow-bands.js';

export type VariantDefinition = {
    readonly id: 'A' | 'B' | 'C';
    readonly name: string;
    readonly isMirror: boolean;
    readonly aspect: number;
    readonly ldkFlex: number;
    readonly bandFactor: number;
    readonly ldkBonus: number;
    readonly isEntryFirst?: boolean | undefined;
    readonly narrow?: NarrowOptions | undefined;
    /** put the LDK at the start of its row so it can sit under the entrance hall */
    readonly isLdkFirst?: boolean | undefined;
    readonly desc: string;
    readonly adjust: (v: InternalPlanValues) => InternalPlanValues;
};

function addUnique(
    arr: readonly string[] | undefined,
    item: string,
): readonly string[] {
    const list = arr ? [...arr] : [];
    if (!list.includes(item)) list.push(item);
    return list;
}

function removeUnique(
    arr: readonly string[] | undefined,
    item: string,
): readonly string[] {
    if (!arr) return [];
    return arr.filter((x) => x !== item);
}

export const VARIANTS: readonly VariantDefinition[] = [
    {
        id: 'A',
        name: '案A｜家事動線重視',
        isMirror: false,
        aspect: 1.1,
        ldkFlex: 3,
        bandFactor: 1.0,
        ldkBonus: 0,
        desc: '水まわりを一直線に並べ、洗う→干す→しまうを最短でつなぐプラン。ランドリールームとファミリークローゼットを確保し、洗面台も2台にします。',
        adjust: (v) => ({
            ...v,
            waterOpts: addUnique(
                addUnique(v.waterOpts, 'ランドリールーム'),
                'パントリー',
            ),
            storageOpts: addUnique(v.storageOpts, 'ファミリークローゼット'),
            washCount: 2,
        }),
    },
    {
        id: 'B',
        name: '案B｜開放感重視',
        isMirror: true,
        aspect: 1.18,
        ldkFlex: 3,
        bandFactor: 1.0,
        ldkBonus: 0,
        desc: '南面採光と庭側の大開口で開放感を最優先にした左右反転プラン。リビング階段と開放的なLDKを重視します。',
        adjust: (v) => ({
            ...v,
            storageOpts: addUnique(v.storageOpts, 'ファミリークローゼット'),
        }),
    },
    {
        id: 'C',
        name: '案C｜コスト重視',
        isMirror: false,
        aspect: 0.95,
        ldkFlex: 2.0,
        bandFactor: 1.0,
        ldkBonus: 0,
        isEntryFirst: true,
        desc: '外周をコンパクトな矩形にまとめ、効率的な廊下動線で建築費を抑えたコスト優先プラン。',
        adjust: (v) => ({
            ...v,
            extraRooms: removeUnique(
                removeUnique(v.extraRooms, '吹き抜け'),
                '趣味室',
            ),
            storageOpts: removeUnique(v.storageOpts, '小屋裏収納'),
            bathSize: v.bathSize === '1.5坪' ? '1.25坪' : v.bathSize,
        }),
    },
];
