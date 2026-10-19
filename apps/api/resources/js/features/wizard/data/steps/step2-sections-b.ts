import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step2SectionsB: readonly Section[] = [
    {
        key: 'frontage_depth_section',
        title: tx(
            '4. 間口・奥行き',
            '4. Frontage & Depth',
            '4. Mặt tiền & Chiều sâu',
        ),
        fields: [
            {
                type: 'number',
                key: 'frontage',
                label: tx(
                    '間口（幅）',
                    'Frontage (width)',
                    'Mặt tiền (chiều rộng)',
                ),
                required: true,
                min: 3,
                max: 50,
                step: 0.5,
                unit: 'm',
                binding: 'site.frontage',
            },
            {
                type: 'number',
                key: 'depth',
                label: tx('奥行き', 'Depth', 'Chiều sâu'),
                required: true,
                min: 3,
                max: 50,
                step: 0.5,
                unit: 'm',
                binding: 'site.depth',
                help: tx(
                    '※ おおよその寸法で構いません。',
                    '* Approximate dimensions are fine.',
                    '* Kích thước ước chừng là được.',
                ),
            },
        ],
    },
    {
        key: 'road_side_section',
        title: tx(
            '5. 道路に接する方向',
            '5. Road facing direction',
            '5. Hướng tiếp giáp đường',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'road_side',
                label: tx(
                    '道路に接する方向',
                    'Road facing direction',
                    'Hướng tiếp giáp đường',
                ),
                required: true,
                multiple: false,
                defaultValue: 'south',
                binding: 'site.roadSide',
                options: [
                    imgOpt(
                        'north',
                        'tile-road-north',
                        '北側',
                        'North',
                        'Phía Bắc',
                    ),
                    imgOpt(
                        'south',
                        'tile-road-south',
                        '南側',
                        'South',
                        'Phía Nam',
                    ),
                    imgOpt(
                        'east',
                        'tile-road-east',
                        '東側',
                        'East',
                        'Phía Đông',
                    ),
                    imgOpt(
                        'west',
                        'tile-road-west',
                        '西側',
                        'West',
                        'Phía Tây',
                    ),
                ],
            },
        ],
    },
];
