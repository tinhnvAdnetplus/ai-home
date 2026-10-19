import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step1SectionsD: readonly Section[] = [
    {
        key: 'style_section',
        title: tx(
            '7. 好みの住宅スタイル',
            '7. Preferred house style',
            '7. Phong cách nhà ưa thích',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'house_style',
                label: tx(
                    '好みの住宅スタイル',
                    'Preferred house style',
                    'Phong cách nhà ưa thích',
                ),
                required: false,
                multiple: false,
                defaultValue: 'modern',
                options: [
                    imgOpt(
                        'modern',
                        'style-modern',
                        'モダン・シンプル',
                        'Modern / simple',
                        'Hiện đại, tối giản',
                    ),
                    imgOpt(
                        'wa',
                        'style-wa',
                        '和風・和モダン',
                        'Japanese / Wa-modern',
                        'Nhật Bản, Wa-modern',
                    ),
                    imgOpt(
                        'natural',
                        'style-natural',
                        'ナチュラル・木の温もり',
                        'Natural / warm wood',
                        'Tự nhiên, gỗ ấm áp',
                    ),
                    imgOpt(
                        'western',
                        'style-western',
                        '洋風・輸入住宅風',
                        'Western / imported style',
                        'Phong cách Tây Âu',
                    ),
                ],
            },
        ],
    },
    {
        key: 'notes_section',
        title: tx(
            '8. その他の希望（任意）',
            '8. Other requests (optional)',
            '8. Yêu cầu khác (tùy chọn)',
        ),
        fields: [
            {
                type: 'textarea',
                key: 'notes_step1',
                label: tx('その他の希望', 'Other requests', 'Yêu cầu khác'),
                required: false,
                maxLength: 200,
                showCounter: true,
                placeholder: tx(
                    '例：平屋が希望だが、予算も重視したい。収納を多くしたい。シンプルなデザインが好き など',
                    'e.g. Prefer one storey but budget matters. Lots of storage. Simple design.',
                    'Ví dụ: Thích nhà một tầng nhưng chú trọng ngân sách, nhiều chỗ chứa đồ, thiết kế đơn giản.',
                ),
            },
        ],
    },
];
