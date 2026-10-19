import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step1SectionsA: readonly Section[] = [
    {
        key: 'purpose',
        title: tx(
            '1. 建築の目的',
            '1. Purpose of building',
            '1. Mục đích xây dựng',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'construction_purpose',
                label: tx(
                    '建築の目的',
                    'Purpose of building',
                    'Mục đích xây dựng',
                ),
                required: true,
                multiple: false,
                defaultValue: 'new_build',
                options: [
                    imgOpt(
                        'new_build',
                        'icon-home',
                        '新しく\n家を建てる',
                        'Build a new house',
                        'Xây nhà mới',
                    ),
                    imgOpt(
                        'rebuild',
                        'icon-rebuild',
                        '現在の家を\n建て替える',
                        'Rebuild the current house',
                        'Xây lại nhà hiện tại',
                    ),
                    imgOpt(
                        'renovate',
                        'icon-renovate',
                        '既存住宅を\nリフォームする',
                        'Renovate an existing house',
                        'Cải tạo nhà hiện có',
                    ),
                ],
            },
        ],
    },
    {
        key: 'house_type_section',
        title: tx('2. 住宅の種類', '2. House type', '2. Loại nhà ở'),
        fields: [
            {
                type: 'image_select',
                key: 'house_type',
                label: tx('住宅の種類', 'House type', 'Loại nhà ở'),
                required: true,
                multiple: false,
                defaultValue: 'custom',
                options: [
                    imgOpt(
                        'custom',
                        'icon-custom',
                        '注文住宅',
                        'Custom home',
                        'Nhà xây theo yêu cầu',
                    ),
                    imgOpt(
                        'two_family',
                        'icon-two-family',
                        '二世帯住宅',
                        'Two-family home',
                        'Nhà hai thế hệ',
                    ),
                    imgOpt(
                        'rental_combo',
                        'icon-rental',
                        '賃貸併用住宅',
                        'Home with rental units',
                        'Nhà kết hợp cho thuê',
                    ),
                    imgOpt('other', 'icon-other', 'その他', 'Other', 'Khác'),
                ],
            },
        ],
    },
];
