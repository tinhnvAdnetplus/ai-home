import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step3SectionsC: readonly Section[] = [
    {
        key: 'plan_water_section',
        title: tx(
            '4. 水回りの設備',
            '4. Water amenities',
            '4. Thiết bị khu vệ sinh',
        ),
        fields: [
            {
                type: 'radio',
                key: 'plan_kitchen',
                label: tx('キッチン', 'Kitchen', 'Nhà bếp'),
                required: true,
                defaultValue: 'counter',
                options: [
                    opt(
                        'counter',
                        '対面キッチン',
                        'Facing counter kitchen',
                        'Bếp đối diện phòng khách',
                    ),
                    opt(
                        'separated',
                        '独立型キッチン',
                        'Separate kitchen',
                        'Bếp riêng biệt',
                    ),
                    opt(
                        'island',
                        'アイランドキッチン',
                        'Island kitchen',
                        'Bếp đảo',
                    ),
                    opt('other', 'その他', 'Other', 'Khác'),
                ],
            },
            {
                type: 'radio',
                key: 'plan_bath',
                label: tx('浴室', 'Bathroom', 'Phòng tắm'),
                required: true,
                defaultValue: 'size_1_0',
                binding: 'rooms.bathSize',
                options: [
                    opt(
                        'size_1_0',
                        '1坪タイプ',
                        '1 tsubo size',
                        'Loại 1 tsubo (~3.3m²)',
                    ),
                    opt(
                        'size_1_25',
                        '1.25坪タイプ',
                        '1.25 tsubo size',
                        'Loại 1.25 tsubo (~4.1m²)',
                    ),
                    opt(
                        'size_1_5',
                        '1.5坪タイプ',
                        '1.5 tsubo size',
                        'Loại 1.5 tsubo (~5.0m²)',
                    ),
                    opt('other', 'その他', 'Other', 'Khác'),
                ],
            },
            {
                type: 'radio',
                key: 'plan_washroom',
                label: tx(
                    '洗面脱衣室',
                    'Washroom / dressing room',
                    'Phòng rửa mặt và thay đồ',
                ),
                required: true,
                defaultValue: 'size_1',
                options: [
                    opt(
                        'size_1',
                        '1畳程度',
                        'Approx. 1 tatami',
                        'Khoảng 1 chiếu',
                    ),
                    opt(
                        'size_2',
                        '2畳程度',
                        'Approx. 2 tatami',
                        'Khoảng 2 chiếu',
                    ),
                    opt(
                        'with_laundry',
                        'ランドリールームを併設',
                        'With attached laundry room',
                        'Kết hợp phòng giặt phơi',
                    ),
                    opt('other', 'その他', 'Other', 'Khác'),
                ],
            },
            {
                type: 'radio',
                key: 'plan_toilet',
                label: tx('トイレ', 'Toilet', 'Nhà vệ sinh'),
                required: true,
                defaultValue: 'two_floors',
                options: [
                    opt(
                        'one_floor',
                        '1か所（1階のみ）',
                        '1 location (1F only)',
                        '1 vị trí (chỉ tầng 1)',
                    ),
                    {
                        ...opt(
                            'two_floors',
                            '2か所（1階・2階）',
                            '2 locations (1F & 2F)',
                            '2 vị trí (tầng 1 & 2)',
                        ),
                        disabledWhen: {
                            or: [
                                { '==': [{ var: 'floors' }, 'one_story'] },
                                { '==': [{ var: 'plan_type' }, 'one_story'] },
                            ],
                        },
                    },
                    {
                        ...opt(
                            'three_or_more',
                            '3か所以上',
                            '3 or more',
                            'Từ 3 vị trí trở lên',
                        ),
                        disabledWhen: {
                            or: [
                                { '==': [{ var: 'floors' }, 'one_story'] },
                                { '==': [{ var: 'plan_type' }, 'one_story'] },
                            ],
                        },
                    },
                    opt('other', 'その他', 'Other', 'Khác'),
                ],
            },
        ],
    },
];
