import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step4SectionsB: readonly Section[] = [
    {
        key: 'life_spaces_section',
        title: tx(
            '3. こだわりの空間（複数選択可）',
            '3. Special spaces (Multiple choice)',
            '3. Không gian yêu thích (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'life_spaces',
                label: tx(
                    'こだわりの空間',
                    'Special spaces',
                    'Không gian yêu thích',
                ),
                required: false,
                multiple: true,
                defaultValue: ['workspace', 'deck_garden'],
                options: [
                    imgOpt(
                        'workspace',
                        'life-space-workspace',
                        '書斎・ワーク\nスペース',
                        'Study / workspace',
                        'Góc làm việc / phòng đọc sách',
                    ),
                    imgOpt(
                        'tatami',
                        'life-space-tatami',
                        '和室',
                        'Japanese tatami room',
                        'Phòng chiếu tatami',
                    ),
                    imgOpt(
                        'fukinuke',
                        'life-space-atrium',
                        '吹き抜け',
                        'Open ceiling / atrium',
                        'Khoảng thông tầng',
                    ),
                    imgOpt(
                        'deck_garden',
                        'life-space-deck-garden',
                        'ウッドデッキ・\n庭',
                        'Wood deck / garden',
                        'Sàn gỗ ngoài trời / sân vườn',
                    ),
                ],
            },
        ],
    },
    {
        key: 'life_pets_section',
        title: tx('4. ペットについて', '4. Pets', '4. Về thú cưng'),
        fields: [
            {
                type: 'image_select',
                key: 'life_pets',
                label: tx('ペットについて', 'Pets', 'Về thú cưng'),
                required: false,
                multiple: true,
                defaultValue: ['dog'],
                options: [
                    imgOpt('dog', 'life-pet-dog', '犬', 'Dog', 'Chó'),
                    imgOpt('cat', 'life-pet-cat', '猫', 'Cat', 'Mèo'),
                    imgOpt(
                        'other_pet',
                        'life-pet-other',
                        'その他',
                        'Other',
                        'Khác',
                    ),
                    imgOpt(
                        'no_pet',
                        'life-pet-none',
                        '飼っていない',
                        'No pets',
                        'Không nuôi thú cưng',
                    ),
                ],
            },
        ],
    },
];
