import { type Section } from '@aihome/config-schema';
import { imgOpt, opt, tx } from '../builders';

export const step4SectionsC: readonly Section[] = [
    {
        key: 'life_parking_section',
        title: tx(
            '5. 駐車・外構の希望',
            '5. Parking & exterior preferences',
            '5. Nguyện vọng về chỗ đỗ xe & ngoại cảnh',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'life_parking',
                label: tx(
                    '駐車・外構の希望',
                    'Parking & exterior preferences',
                    'Nguyện vọng về chỗ đỗ xe & ngoại cảnh',
                ),
                required: false,
                multiple: true,
                defaultValue: ['cars_2'],
                options: [
                    {
                        ...imgOpt(
                            'cars_1',
                            'life-parking-1',
                            '1台',
                            '1 car',
                            '1 xe',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'plan_parking_count' }, 'none'],
                        },
                    },
                    {
                        ...imgOpt(
                            'cars_2',
                            'life-parking-2',
                            '2台',
                            '2 cars',
                            '2 xe',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'plan_parking_count' }, 'none'],
                        },
                    },
                    {
                        ...imgOpt(
                            'cars_3_plus',
                            'life-parking-3',
                            '3台以上',
                            '3 or more cars',
                            'Từ 3 xe trở lên',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'plan_parking_count' }, 'none'],
                        },
                    },
                    imgOpt(
                        'bicycle_space',
                        'life-parking-bicycle',
                        '駐輪スペース\nも必要',
                        'Bicycle parking space also needed',
                        'Cần thêm chỗ để xe đạp',
                    ),
                ],
            },
        ],
    },
    {
        key: 'life_work_section',
        title: tx(
            '6. 在宅ワークの希望',
            '6. Remote work preferences',
            '6. Nguyện vọng làm việc tại nhà',
        ),
        fields: [
            {
                type: 'radio',
                key: 'life_work',
                label: tx(
                    '在宅ワークの希望',
                    'Remote work preferences',
                    'Nguyện vọng làm việc tại nhà',
                ),
                required: false,
                defaultValue: 'not_needed',
                disabledWhen: {
                    '==': [{ var: 'plan_study_count' }, 'count_0'],
                },
                options: [
                    {
                        ...opt(
                            'dedicated_room',
                            '必要（専用の書斎が欲しい）',
                            'Needed (dedicated study / office)',
                            'Cần thiết (muốn có phòng làm việc riêng)',
                        ),
                        disabledWhen: {
                            '==': [{ var: 'plan_study_count' }, 'count_0'],
                        },
                    },
                    opt(
                        'living_corner',
                        'リビングの一角で対応',
                        'Living room corner is sufficient',
                        'Góc nhỏ tại phòng khách là đủ',
                    ),
                    opt(
                        'future_need',
                        '今は必要ないが将来は検討',
                        'Not needed now, consider in future',
                        'Hiện chưa cần nhưng sẽ cân nhắc sau',
                    ),
                    opt(
                        'not_needed',
                        '必要ない',
                        'Not needed',
                        'Không có nhu cầu',
                    ),
                ],
            },
        ],
    },
];
