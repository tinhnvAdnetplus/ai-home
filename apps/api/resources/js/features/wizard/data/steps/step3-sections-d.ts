import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step3SectionsD: readonly Section[] = [
    {
        key: 'plan_storage_section',
        title: tx(
            '5. 収納の希望',
            '5. Storage preferences',
            '5. Không gian lưu trữ',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'plan_storage',
                label: tx(
                    '収納の希望',
                    'Storage preferences',
                    'Không gian lưu trữ',
                ),
                required: true,
                multiple: true,
                defaultValue: ['walkin_closet', 'pantry'],
                options: [
                    imgOpt(
                        'walkin_closet',
                        'tile-storage-wic',
                        'ウォークインクローゼット',
                        'Walk-in closet',
                        'Phòng thay đồ walk-in',
                    ),
                    imgOpt(
                        'pantry',
                        'tile-storage-pantry',
                        'パントリー',
                        'Kitchen pantry',
                        'Kho đồ ăn nhà bếp',
                    ),
                    imgOpt(
                        'shoes_cloak',
                        'tile-storage-shoes',
                        'シューズクローク',
                        'Shoe cloakroom',
                        'Tủ giày',
                    ),
                    {
                        ...imgOpt(
                            'under_stairs',
                            'tile-storage-stairs',
                            '階段下収納',
                            'Under-stairs storage',
                            'Gầm cầu thang',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'floors' }, 'one_story'],
                        },
                    },
                    imgOpt(
                        'other_storage',
                        'tile-storage-other',
                        'その他の収納',
                        'Other storage',
                        'Chỗ chứa đồ khác',
                    ),
                ],
            },
        ],
    },
];
