import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step5SectionsB: readonly Section[] = [
    {
        key: 'design_exterior_colors_section',
        title: tx(
            '3. 外壁・屋根の色',
            '3. Exterior wall & roof colors',
            '3. Màu tường ngoại thất & mái nhà',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_exterior_wall_color',
                label: tx(
                    '外壁の色（複数選択可）',
                    'Exterior wall color (Multiple selections allowed)',
                    'Màu tường ngoại thất (Có thể chọn nhiều)',
                ),
                required: true,
                multiple: true,
                defaultValue: ['white'],
                options: [
                    imgOpt(
                        'white',
                        'color-white',
                        'ホワイト',
                        'White',
                        'Trắng',
                    ),
                    imgOpt('beige', 'color-beige', 'ベージュ', 'Beige', 'Be'),
                    imgOpt('gray', 'color-gray', 'グレー', 'Gray', 'Xám'),
                    imgOpt('brown', 'color-brown', 'ブラウン', 'Brown', 'Nâu'),
                    imgOpt('black', 'color-black', 'ブラック', 'Black', 'Đen'),
                    imgOpt('other', 'color-other', 'その他', 'Other', 'Khác'),
                ],
            },
            {
                type: 'image_select',
                key: 'design_roof_color',
                label: tx(
                    '屋根の色（複数選択可）',
                    'Roof color (Multiple selections allowed)',
                    'Màu mái nhà (Có thể chọn nhiều)',
                ),
                required: true,
                multiple: true,
                defaultValue: ['black'],
                options: [
                    imgOpt('black', 'color-black', 'ブラック', 'Black', 'Đen'),
                    imgOpt('gray', 'color-gray', 'グレー', 'Gray', 'Xám'),
                    imgOpt('brown', 'color-brown', 'ブラウン', 'Brown', 'Nâu'),
                    imgOpt(
                        'navy',
                        'color-navy',
                        'ネイビー',
                        'Navy',
                        'Xanh navy',
                    ),
                    imgOpt(
                        'green',
                        'color-green',
                        'グリーン',
                        'Green',
                        'Xanh lá',
                    ),
                    imgOpt('other', 'color-other', 'その他', 'Other', 'Khác'),
                ],
            },
        ],
    },
    {
        key: 'design_interior_materials_section',
        title: tx(
            '4. 室内の色・素材のイメージ',
            '4. Interior colors & materials image',
            '4. Hình ảnh màu sắc & chất liệu nội thất',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_flooring_material',
                label: tx(
                    '床材のイメージ',
                    'Flooring image',
                    'Hình ảnh sàn nhà',
                ),
                required: true,
                multiple: false,
                defaultValue: 'natural',
                options: [
                    imgOpt(
                        'natural',
                        'floor-natural',
                        'ナチュラル',
                        'Natural',
                        'Tự nhiên',
                    ),
                    imgOpt('dark', 'floor-dark', 'ダーク', 'Dark', 'Đậm'),
                    imgOpt('gray', 'floor-gray', 'グレー', 'Gray', 'Xám'),
                    imgOpt(
                        'tile',
                        'floor-tile',
                        'タイル調',
                        'Tile look',
                        'Vân gạch men',
                    ),
                ],
            },
            {
                type: 'image_select',
                key: 'design_wall_color',
                label: tx('壁の色', 'Wall color', 'Màu tường trong nhà'),
                required: true,
                multiple: false,
                defaultValue: 'bright',
                options: [
                    imgOpt(
                        'bright',
                        'color-white',
                        'ブライト',
                        'Bright',
                        'Sáng',
                    ),
                    imgOpt('beige', 'color-beige', 'ベージュ', 'Beige', 'Be'),
                    imgOpt('gray', 'color-gray', 'グレー', 'Gray', 'Xám'),
                    imgOpt(
                        'accent',
                        'color-other',
                        'アクセント',
                        'Accent',
                        'Điểm nhấn',
                    ),
                ],
            },
        ],
    },
];
