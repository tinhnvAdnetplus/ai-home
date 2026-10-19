import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step5SectionsD: readonly Section[] = [
    {
        key: 'design_photos_section',
        title: tx(
            '6. 好きな写真を選んでください（複数選択可）',
            '6. Choose your favorite photos (Multiple selections allowed)',
            '6. Chọn những bức ảnh bạn thích (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'design_favorite_photos',
                label: tx(
                    '好きな写真を選んでください',
                    'Choose your favorite photos',
                    'Chọn những bức ảnh bạn thích',
                ),
                required: false,
                multiple: true,
                defaultValue: ['photo_modern_exterior', 'photo_wa_exterior'],
                options: [
                    imgOpt(
                        'photo_modern_exterior',
                        'photo-modern-exterior',
                        'モダンな外観',
                        'Modern exterior',
                        'Ngoại thất hiện đại',
                    ),
                    imgOpt(
                        'photo_bright_dining',
                        'photo-bright-dining',
                        '明るいダイニング',
                        'Bright dining area',
                        'Phòng ăn ngập tràn ánh sáng',
                    ),
                    imgOpt(
                        'photo_wa_exterior',
                        'photo-wafu-exterior',
                        '和モダンの外観',
                        'Japanese modern exterior',
                        'Ngoại thất Nhật hiện đại',
                    ),
                    imgOpt(
                        'photo_living_room',
                        'photo-living-room',
                        '開放的なリビング',
                        'Open living room',
                        'Phòng khách thoáng đãng',
                    ),
                    imgOpt(
                        'photo_natural_interior',
                        'photo-natural-interior',
                        '木の温もりある内装',
                        'Warm wood interior',
                        'Nội thất gỗ ấm cúng',
                    ),
                    imgOpt(
                        'photo_stylish_exterior',
                        'photo-stylish-exterior',
                        'スタイリッシュな外観',
                        'Stylish exterior',
                        'Ngoại thất sang trọng',
                    ),
                ],
            },
        ],
    },
    {
        key: 'design_notes_section',
        title: tx(
            '7. その他のご希望（自由記入・任意）',
            '7. Other requests (Free text, optional)',
            '7. Yêu cầu khác (Tự do ghi nhận, tùy chọn)',
        ),
        fields: [
            {
                type: 'textarea',
                key: 'design_notes',
                label: tx('その他のご希望', 'Other requests', 'Yêu cầu khác'),
                required: false,
                maxLength: 300,
                showCounter: true,
                placeholder: tx(
                    '例：木の温もりのある外観が好きです。リビングは明るく、大きな窓で庭が見えるようにしたい。シンプルで落ち着いた内装にしたい。',
                    'e.g. Love warm wooden exterior, bright living room with large windows overlooking garden, simple and calm interior.',
                    'Ví dụ: Thích ngoại thất ấm áp của gỗ. Muốn phòng khách sáng sủa với cửa sổ lớn nhìn ra vườn. Nội thất đơn giản, trầm ấm.',
                ),
            },
        ],
    },
];
