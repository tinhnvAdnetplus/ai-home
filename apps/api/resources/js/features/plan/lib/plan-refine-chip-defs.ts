/**
 * Preset refinement chips definitions for AI refinement.
 */

export type RefineChipKey =
    | 'plan:refineChipIsland'
    | 'plan:refineChipKidsPlus'
    | 'plan:refineChipStoragePlus'
    | 'plan:refineChipLdk20'
    | 'plan:refineChipDeck'
    | 'plan:refineChipCheaper'
    | 'plan:refineChipCompact'
    | 'plan:refineChipHiraya'
    | 'plan:refineChipVoid'
    | 'plan:refineChipStudy'
    | 'plan:refineChipWc2'
    | 'plan:refineChipLaundry';

export interface RefineChipDef {
    readonly id: string;
    readonly labelKey: RefineChipKey;
    readonly description: string;
}

export const REFINE_CHIP_LIST: readonly RefineChipDef[] = [
    {
        id: 'island',
        labelKey: 'plan:refineChipIsland',
        description: 'キッチンをアイランド型に変更',
    },
    {
        id: 'kids+',
        labelKey: 'plan:refineChipKidsPlus',
        description: '子ども部屋を拡大',
    },
    {
        id: 'storage+',
        labelKey: 'plan:refineChipStoragePlus',
        description: '収納を大容量希望に変更',
    },
    {
        id: 'ldk20',
        labelKey: 'plan:refineChipLdk20',
        description: 'LDKを20帖に設定',
    },
    {
        id: 'deck',
        labelKey: 'plan:refineChipDeck',
        description: 'ウッドデッキを追加',
    },
    {
        id: 'cheaper',
        labelKey: 'plan:refineChipCheaper',
        description: 'コストを抑えた仕様に調整',
    },
    {
        id: 'compact',
        labelKey: 'plan:refineChipCompact',
        description: '延床面積とLDKをコンパクトに調整',
    },
    {
        id: 'hiraya',
        labelKey: 'plan:refineChipHiraya',
        description: '平屋（1階建て）に変更',
    },
    {
        id: 'void',
        labelKey: 'plan:refineChipVoid',
        description: '吹き抜けを追加',
    },
    {
        id: 'study',
        labelKey: 'plan:refineChipStudy',
        description: '書斎を追加',
    },
    {
        id: 'wc2',
        labelKey: 'plan:refineChipWc2',
        description: 'トイレを2カ所に変更',
    },
    {
        id: 'laundry',
        labelKey: 'plan:refineChipLaundry',
        description: 'ランドリールームを追加',
    },
];
