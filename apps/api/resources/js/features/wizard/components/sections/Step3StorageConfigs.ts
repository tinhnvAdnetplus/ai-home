import { Package, Utensils, DoorOpen, Layers, Ellipsis } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocalizedText } from '@aihome/config-schema';

export type StorageTileConfig = {
    readonly value: string;
    readonly label: LocalizedText;
    readonly labelLines: {
        readonly ja: readonly string[];
        readonly en: readonly string[];
        readonly vi: readonly string[];
    };
    readonly photoName: string;
    readonly fallbackIcon: LucideIcon;
};

export function getStorageLabelLines(
    tile: StorageTileConfig,
    lang: string,
): readonly string[] {
    if (lang === 'en') return tile.labelLines.en;
    if (lang === 'vi') return tile.labelLines.vi;
    return tile.labelLines.ja;
}

export const STORAGE_TILES: readonly StorageTileConfig[] = [
    {
        value: 'walkin_closet',
        label: {
            ja: 'ウォークインクローゼット',
            en: 'Walk-in closet',
            vi: 'Tủ quần áo walk-in',
        },
        labelLines: {
            ja: ['ウォークイン', 'クローゼット'],
            en: ['Walk-in', 'closet'],
            vi: ['Tủ quần áo', 'walk-in'],
        },
        photoName: 'storage-wic',
        fallbackIcon: Package,
    },
    {
        value: 'pantry',
        label: {
            ja: 'パントリー',
            en: 'Pantry',
            vi: 'Tủ đồ khô bếp',
        },
        labelLines: {
            ja: ['パントリー'],
            en: ['Pantry'],
            vi: ['Tủ đồ khô', 'bếp'],
        },
        photoName: 'storage-pantry',
        fallbackIcon: Utensils,
    },
    {
        value: 'shoes_cloak',
        label: {
            ja: 'シューズクローク',
            en: 'Shoe closet',
            vi: 'Tủ giày',
        },
        labelLines: {
            ja: ['シューズ', 'クローク'],
            en: ['Shoe', 'closet'],
            vi: ['Tủ giày'],
        },
        photoName: 'storage-shoes',
        fallbackIcon: DoorOpen,
    },
    {
        value: 'under_stairs',
        label: {
            ja: '階段下収納',
            en: 'Under-stairs storage',
            vi: 'Kho gầm cầu thang',
        },
        labelLines: {
            ja: ['階段下収納'],
            en: ['Under-stairs', 'storage'],
            vi: ['Kho gầm', 'cầu thang'],
        },
        photoName: 'storage-stairs',
        fallbackIcon: Layers,
    },
    {
        value: 'other_storage',
        label: {
            ja: 'その他の収納',
            en: 'Other storage',
            vi: 'Kho chứa khác',
        },
        labelLines: {
            ja: ['その他の収納'],
            en: ['Other', 'storage'],
            vi: ['Kho chứa', 'khác'],
        },
        photoName: 'storage-other',
        fallbackIcon: Ellipsis,
    },
];
