import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step3SectionsA: readonly Section[] = [
    {
        key: 'plan_type_section',
        title: tx(
            '1. 間取りのタイプ',
            '1. Floor plan type',
            '1. Loại mặt bằng',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'plan_type',
                label: tx('間取りのタイプ', 'Floor plan type', 'Loại mặt bằng'),
                required: true,
                multiple: false,
                defaultValue: 'two_story',
                options: [
                    imgOpt(
                        'one_story',
                        'tile-plan-type-1story',
                        '平屋',
                        'One-story',
                        'Nhà một tầng',
                    ),
                    imgOpt(
                        'two_story',
                        'tile-plan-type-2story',
                        '2階建て',
                        '2-story',
                        'Nhà 2 tầng',
                    ),
                    imgOpt(
                        'three_story',
                        'tile-plan-type-3story',
                        '3階建て',
                        '3-story',
                        'Nhà 3 tầng',
                    ),
                    imgOpt(
                        'other',
                        'tile-plan-type-other',
                        'その他（相談したい）',
                        'Other (consult)',
                        'Khác (cần tư vấn)',
                    ),
                ],
            },
        ],
    },
    {
        key: 'plan_area_section',
        title: tx(
            '2. 延床面積の希望',
            '2. Desired total floor area',
            '2. Tổng diện tích sàn mong muốn',
        ),
        fields: [
            {
                type: 'number',
                key: 'plan_target_area',
                label: tx(
                    '延床面積の希望',
                    'Desired total floor area',
                    'Tổng diện tích sàn mong muốn',
                ),
                required: true,
                min: 15,
                max: 100,
                step: 1,
                unit: '坪',
                allowedUnits: ['坪', 'm²'],
                defaultValue: 30,
                binding: 'building.targetArea',
                help: tx(
                    '広さの目安：25坪（約82㎡）/ 30坪（約99㎡）/ 35坪（約116㎡）/ 40坪（約132㎡）',
                    'Size guide: 25 tsubo (~82 m²) / 30 tsubo (~99 m²) / 35 tsubo (~116 m²) / 40 tsubo (~132 m²)',
                    'Gợi ý diện tích: 25 tsubo (~82 m²) / 30 tsubo (~99 m²) / 35 tsubo (~116 m²) / 40 tsubo (~132 m²)',
                ),
            },
        ],
    },
];
