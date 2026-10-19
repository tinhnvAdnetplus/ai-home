import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step2SectionsC: readonly Section[] = [
    {
        key: 'road_width_section',
        title: tx(
            '6. 前面道路の幅',
            '6. Front road width',
            '6. Độ rộng đường trước nhà',
        ),
        fields: [
            {
                type: 'number',
                key: 'road_width',
                label: tx(
                    '前面道路の幅',
                    'Front road width',
                    'Độ rộng đường trước nhà',
                ),
                required: false,
                min: 2,
                max: 20,
                step: 0.5,
                unit: 'm',
                help: tx(
                    '例：4 m ※ わからない場合は空欄で構いません。',
                    'e.g. 4 m * Leave blank if you are not sure.',
                    'Ví dụ: 4 m * Nếu không rõ có thể để trống.',
                ),
            },
        ],
    },
    {
        key: 'elevation_section',
        title: tx('7. 土地の高低差', '7. Land elevation', '7. Độ dốc khu đất'),
        fields: [
            {
                type: 'radio',
                key: 'land_elevation',
                label: tx('土地の高低差', 'Land elevation', 'Độ dốc khu đất'),
                required: false,
                defaultValue: 'flat',
                options: [
                    opt(
                        'flat',
                        'ほぼ平坦',
                        'Mostly flat',
                        'Gần như bằng phẳng',
                    ),
                    opt(
                        'higher_than_road',
                        '道路より高い',
                        'Higher than road',
                        'Cao hơn mặt đường',
                    ),
                    opt(
                        'lower_than_road',
                        '道路より低い',
                        'Lower than road',
                        'Thấp hơn mặt đường',
                    ),
                    opt(
                        'sloped',
                        '敷地内に高低差がある',
                        'Elevation difference on site',
                        'Có độ dốc trong khuôn viên',
                    ),
                    opt(
                        'unknown',
                        'わからない',
                        'Unknown / Not sure',
                        'Không rõ',
                    ),
                ],
            },
        ],
    },
];
