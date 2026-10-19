import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step1SectionsC: readonly Section[] = [
    {
        key: 'budget_section',
        title: tx(
            '5. 建築予算',
            '5. Construction budget',
            '5. Ngân sách xây dựng',
        ),
        fields: [
            {
                type: 'radio',
                key: 'budget_range',
                label: tx(
                    '建築予算',
                    'Construction budget',
                    'Ngân sách xây dựng',
                ),
                required: true,
                defaultValue: 'budget_2500_3500',
                help: tx(
                    '※ 建物本体・付帯工事・土地代を含むかは、別途確認します。',
                    '* Whether the building, extra works and land are included is confirmed separately.',
                    '* Việc có bao gồm nhà, công trình phụ và tiền đất hay không sẽ được xác nhận riêng.',
                ),
                options: [
                    opt(
                        'budget_under_1500',
                        '1,500万円未満',
                        'Under JPY 15 million',
                        'Dưới 15 triệu Yên',
                    ),
                    opt(
                        'budget_1500_2500',
                        '1,500万〜2,500万円',
                        'JPY 15-25 million',
                        '15–25 triệu Yên',
                    ),
                    opt(
                        'budget_2500_3500',
                        '2,500万〜3,500万円',
                        'JPY 25-35 million',
                        '25–35 triệu Yên',
                    ),
                    opt(
                        'budget_3500_5000',
                        '3,500万〜5,000万円',
                        'JPY 35-50 million',
                        '35–50 triệu Yên',
                    ),
                    opt(
                        'budget_over_5000',
                        '5,000万円以上',
                        'JPY 50 million or more',
                        'Từ 50 triệu Yên',
                    ),
                    opt(
                        'budget_undecided',
                        'まだ決まっていない',
                        'Not decided yet',
                        'Chưa quyết định',
                    ),
                ],
            },
        ],
    },
    {
        key: 'area_section',
        title: tx(
            '6. 希望する延床面積',
            '6. Desired floor area',
            '6. Tổng diện tích sàn mong muốn',
        ),
        fields: [
            {
                type: 'radio',
                key: 'target_area_range',
                label: tx(
                    '希望する延床面積',
                    'Desired floor area',
                    'Tổng diện tích sàn mong muốn',
                ),
                required: false,
                defaultValue: 'area_30_35',
                options: [
                    opt(
                        'area_under_25',
                        '25坪未満',
                        'Under 25 tsubo',
                        'Dưới 25 tsubo',
                    ),
                    opt('area_25_30', '25〜30坪', '25-30 tsubo', '25–30 tsubo'),
                    opt('area_30_35', '30〜35坪', '30-35 tsubo', '30–35 tsubo'),
                    opt('area_35_40', '35〜40坪', '35-40 tsubo', '35–40 tsubo'),
                    opt(
                        'area_over_40',
                        '40坪以上',
                        '40 tsubo or more',
                        'Từ 40 tsubo',
                    ),
                    opt(
                        'area_unknown',
                        'わからない・相談したい',
                        'Not sure / need advice',
                        'Chưa rõ / cần tư vấn',
                    ),
                ],
            },
        ],
    },
];
