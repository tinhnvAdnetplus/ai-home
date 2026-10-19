import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step5SectionsA: readonly Section[] = [
    {
        key: 'design_exterior_style_section',
        title: tx(
            '1. 外観のデザインスタイル（複数選択可）',
            '1. Exterior design style (Multiple selections allowed)',
            '1. Phong cách thiết kế ngoại thất (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_exterior_style',
                label: tx(
                    '外観のデザインスタイル',
                    'Exterior design style',
                    'Phong cách thiết kế ngoại thất',
                ),
                required: true,
                multiple: true,
                defaultValue: ['modern'],
                options: [
                    imgOpt(
                        'modern',
                        'design-style-modern',
                        'モダン・シンプル',
                        'Modern / Simple',
                        'Hiện đại / Tối giản',
                    ),
                    imgOpt(
                        'natural',
                        'design-style-natural',
                        'ナチュラル（木の温もり）',
                        'Natural (Warm wood)',
                        'Tự nhiên (Ấm áp gỗ)',
                    ),
                    imgOpt(
                        'japanese_modern',
                        'design-style-wafu',
                        '和風・和モダン',
                        'Japanese / Japanese Modern',
                        'Nhật Bản / Nhật hiện đại',
                    ),
                    imgOpt(
                        'western',
                        'design-style-western',
                        '洋風（南欧風）',
                        'Western (Southern European)',
                        'Phong cách Âu (Địa Trung Hải)',
                    ),
                    imgOpt(
                        'stylish',
                        'design-style-stylish',
                        'スタイリッシュ（黒・グレー）',
                        'Stylish (Black / Grey)',
                        'Phong cách (Đen / Xám)',
                    ),
                    imgOpt(
                        'other',
                        'design-style-other',
                        'その他（自由記入）',
                        'Other (Free entry)',
                        'Khác (Tự điền)',
                    ),
                ],
            },
        ],
    },
    {
        key: 'design_interior_style_section',
        title: tx(
            '2. 内装のデザインスタイル（複数選択可）',
            '2. Interior design style (Multiple selections allowed)',
            '2. Phong cách thiết kế nội thất (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_interior_style',
                label: tx(
                    '内装のデザインスタイル',
                    'Interior design style',
                    'Phong cách thiết kế nội thất',
                ),
                required: true,
                multiple: true,
                defaultValue: ['natural'],
                options: [
                    imgOpt(
                        'natural',
                        'design-interior-natural',
                        'ナチュラル（明るい木の素材感）',
                        'Natural (Bright wood texture)',
                        'Tự nhiên (Chất liệu gỗ sáng)',
                    ),
                    imgOpt(
                        'modern',
                        'design-interior-modern',
                        'モダン（シンプル）',
                        'Modern (Simple)',
                        'Hiện đại (Đơn giản)',
                    ),
                    imgOpt(
                        'hotel_like',
                        'design-interior-hotel',
                        'ホテルライク（高級感）',
                        'Hotel-like (Luxury)',
                        'Đẳng cấp khách sạn',
                    ),
                    imgOpt(
                        'japanese_modern',
                        'design-interior-wafu',
                        '和モダン（落ち着いた雰囲気）',
                        'Japanese Modern (Calm atmosphere)',
                        'Nhật hiện đại (Không khí trầm ấm)',
                    ),
                    imgOpt(
                        'scandinavian',
                        'design-interior-nordic',
                        '北欧風（やさしい色合い）',
                        'Scandinavian (Soft colors)',
                        'Bắc Âu (Màu sắc nhẹ nhàng)',
                    ),
                    imgOpt(
                        'industrial',
                        'design-interior-industrial',
                        'インダストリアル（無機質でおしゃれ）',
                        'Industrial (Inorganic and stylish)',
                        'Phong cách công nghiệp (Cá tính & mộc mạc)',
                    ),
                ],
            },
        ],
    },
];
