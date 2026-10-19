import { Utensils, Bath, Shirt, Droplets } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocalizedText } from '@aihome/config-schema';

export type WaterOption = {
    readonly value: string;
    readonly label: LocalizedText;
};

export type WaterColumnConfig = {
    readonly id: string;
    readonly title: LocalizedText;
    readonly photoName: string;
    readonly fieldKey: string;
    readonly fallbackIcon: LucideIcon;
    readonly options: readonly WaterOption[];
};

const opt = (
    value: string,
    ja: string,
    en: string,
    vi: string,
): WaterOption => ({
    value,
    label: { ja, en, vi },
});

export const WATER_COLUMNS: readonly WaterColumnConfig[] = [
    {
        id: 'kitchen',
        title: { ja: 'キッチン', en: 'Kitchen', vi: 'Nhà bếp' },
        photoName: 'wet-kitchen',
        fieldKey: 'plan_kitchen',
        fallbackIcon: Utensils,
        options: [
            opt('counter', '対面キッチン', 'Open counter', 'Bếp mở đối diện'),
            opt(
                'separated',
                '独立型キッチン',
                'Separate kitchen',
                'Bếp riêng biệt',
            ),
            opt('island', 'アイランドキッチン', 'Island kitchen', 'Bếp đảo'),
            opt('other', 'その他', 'Other', 'Khác'),
        ],
    },
    {
        id: 'bath',
        title: { ja: '浴室', en: 'Bathroom', vi: 'Phòng tắm' },
        photoName: 'wet-bath',
        fieldKey: 'plan_bath',
        fallbackIcon: Bath,
        options: [
            opt(
                'size_1_0',
                '1坪タイプ',
                '1 tsubo (~3.3m²)',
                'Loại 1 tsubo (~3,3m²)',
            ),
            opt(
                'size_1_25',
                '1.25坪タイプ',
                '1.25 tsubo (~4.1m²)',
                'Loại 1,25 tsubo (~4,1m²)',
            ),
            opt(
                'size_1_5',
                '1.5坪タイプ',
                '1.5 tsubo (~5m²)',
                'Loại 1,5 tsubo (~5m²)',
            ),
            opt('other', 'その他', 'Other', 'Khác'),
        ],
    },
    {
        id: 'washroom',
        title: {
            ja: '洗面脱衣室',
            en: 'Washroom & Changing',
            vi: 'Phòng giặt & thay đồ',
        },
        photoName: 'wet-wash',
        fieldKey: 'plan_washroom',
        fallbackIcon: Shirt,
        options: [
            opt(
                'size_1',
                '1畳程度',
                '~1 tatami (~1.65m²)',
                'Khoảng 1 chiếu (~1,65m²)',
            ),
            opt(
                'size_2',
                '2畳程度',
                '~2 tatami (~3.3m²)',
                'Khoảng 2 chiếu (~3,3m²)',
            ),
            opt(
                'with_laundry',
                'ランドリールームを併設',
                'With laundry room',
                'Kèm phòng giặt',
            ),
            opt('other', 'その他', 'Other', 'Khác'),
        ],
    },
    {
        id: 'toilet',
        title: { ja: 'トイレ', en: 'Toilet', vi: 'Nhà vệ sinh' },
        photoName: 'wet-toilet',
        fieldKey: 'plan_toilet',
        fallbackIcon: Droplets,
        options: [
            opt(
                'one_floor',
                '1か所（1階のみ）',
                '1 room (1F only)',
                '1 phòng (chỉ tầng 1)',
            ),
            opt(
                'two_floors',
                '2か所（1階・2階）',
                '2 rooms (1F & 2F)',
                '2 phòng (tầng 1 & 2)',
            ),
            opt('three_or_more', '3か所以上', '3+ rooms', 'Từ 3 phòng trở lên'),
            opt('other', 'その他', 'Other', 'Khác'),
        ],
    },
];
