import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step5SectionsC: readonly Section[] = [
    {
        key: 'design_features_section',
        title: tx(
            '5. こだわりの外観・内装（複数選択可）',
            '5. Exterior & interior features (Multiple selections allowed)',
            '5. Điểm nhấn ngoại thất & nội thất (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_features',
                label: tx(
                    'こだわりの外観・内装',
                    'Exterior & interior features',
                    'Điểm nhấn ngoại thất & nội thất',
                ),
                required: false,
                multiple: true,
                defaultValue: ['large_window', 'wood_deck', 'green_exterior'],
                options: [
                    imgOpt(
                        'large_window',
                        'design-feature-window',
                        '大きな窓',
                        'Large windows',
                        'Cửa sổ lớn',
                    ),
                    imgOpt(
                        'wood_deck',
                        'design-feature-deck',
                        'ウッドデッキ',
                        'Wood deck',
                        'Sàn gỗ ngoài trời',
                    ),
                    {
                        ...imgOpt(
                            'fukinuke',
                            'design-feature-atrium',
                            '吹き抜け',
                            'Open ceiling / atrium',
                            'Thông tầng',
                        ),
                        disabledWhen: {
                            or: [
                                { '==': [{ var: 'floors' }, 'one_story'] },
                                { '==': [{ var: 'plan_type' }, 'one_story'] },
                            ],
                        },
                    },
                    imgOpt(
                        'simple_facade',
                        'design-feature-facade',
                        'シンプルな外観',
                        'Simple facade',
                        'Mặt tiền tối giản',
                    ),
                    imgOpt(
                        'green_exterior',
                        'design-feature-garden',
                        '緑のある外構',
                        'Green landscaping',
                        'Sân vườn nhiều cây xanh',
                    ),
                    {
                        ...imgOpt(
                            'garage',
                            'design-feature-garage',
                            'ガレージ',
                            'Garage',
                            'Gara để xe',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'plan_parking_count' }, 'none'],
                        },
                    },
                ],
            },
        ],
    },
];
