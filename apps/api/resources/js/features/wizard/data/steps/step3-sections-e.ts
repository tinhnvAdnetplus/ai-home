import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step3SectionsE: readonly Section[] = [
    {
        key: 'plan_parking_section',
        title: tx('6. 駐車スペース', '6. Parking space', '6. Chỗ để xe'),
        fields: [
            {
                type: 'select',
                key: 'plan_parking_count',
                label: tx('必要な台数', 'Number of cars', 'Số lượng xe cần đỗ'),
                required: true,
                defaultValue: 'cars_2',
                options: [
                    opt(
                        'none',
                        '不要（0台）',
                        'Not needed (0 cars)',
                        'Không cần (0 xe)',
                    ),
                    opt('cars_1', '1台', '1 car', '1 xe'),
                    opt('cars_2', '2台', '2 cars', '2 xe'),
                    opt('cars_3', '3台', '3 cars', '3 xe'),
                    opt(
                        'cars_4_plus',
                        '4台以上',
                        '4 or more cars',
                        'Từ 4 xe trở lên',
                    ),
                ],
            },
            {
                type: 'checkbox_group',
                key: 'plan_parking_options',
                label: tx(
                    '駐車場の追加希望',
                    'Additional parking preferences',
                    'Yêu cầu thêm về bãi đỗ xe',
                ),
                required: false,
                defaultValue: ['carport'],
                disabledWhen: {
                    '==': [{ var: 'plan_parking_count' }, 'none'],
                },
                options: [
                    opt(
                        'carport',
                        'カーポートを希望',
                        'Carport desired',
                        'Mong muốn có mái che carport',
                    ),
                    opt(
                        'guest_parking',
                        '来客用も確保したい',
                        'Want guest parking space',
                        'Muốn có thêm chỗ đỗ cho khách',
                    ),
                ],
            },
        ],
    },
];
