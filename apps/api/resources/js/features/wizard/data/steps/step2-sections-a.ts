import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step2SectionsA: readonly Section[] = [
    {
        key: 'land_location_section',
        title: tx('1. 土地の所在地', '1. Land location', '1. Vị trí khu đất'),
        fields: [
            {
                type: 'text',
                key: 'land_location',
                label: tx('土地の所在地', 'Land location', 'Vị trí khu đất'),
                required: false,
                maxLength: 100,
                placeholder: tx(
                    '例：香川県善通寺市（住所は任意です）',
                    'e.g. Zentsuji City, Kagawa (address is optional)',
                    'Ví dụ: Thành phố Zentsuji, Kagawa (địa chỉ là tùy chọn)',
                ),
            },
        ],
    },
    {
        key: 'land_area_section',
        title: tx('2. 土地の面積', '2. Land area', '2. Diện tích đất'),
        fields: [
            {
                type: 'number',
                key: 'land_area',
                label: tx('土地の面積', 'Land area', 'Diện tích đất'),
                required: true,
                min: 10,
                max: 500,
                step: 0.5,
                unit: '坪',
                allowedUnits: ['坪', 'm²'],
                binding: 'site.landAreaTsubo',
                help: tx(
                    '例：60 坪（約 198 ㎡） ※ ㎡でも入力できます',
                    'e.g. 60 tsubo (approx. 198 m²) * You can also enter in m²',
                    'Ví dụ: 60 tsubo (khoảng 198 m²) * Có thể nhập theo m²',
                ),
            },
        ],
    },
    {
        key: 'land_shape_section',
        title: tx('3. 土地の形状', '3. Land shape', '3. Hình dạng khu đất'),
        fields: [
            {
                type: 'image_select',
                key: 'land_shape',
                label: tx('土地の形状', 'Land shape', 'Hình dạng khu đất'),
                required: true,
                multiple: false,
                defaultValue: 'rectangle',
                binding: 'site.landShape',
                options: [
                    imgOpt(
                        'rectangle',
                        'tile-shape-rectangle',
                        '長方形',
                        'Rectangle',
                        'Hình chữ nhật',
                    ),
                    imgOpt(
                        'square',
                        'tile-shape-square',
                        '正方形',
                        'Square',
                        'Hình vuông',
                    ),
                    imgOpt(
                        'irregular',
                        'tile-shape-irregular',
                        '台形・変形地',
                        'Irregular / Trapezoid',
                        'Đất hình thang / Dị hình',
                    ),
                    imgOpt(
                        'unknown',
                        'tile-shape-unknown',
                        '不明',
                        'Unknown',
                        'Không rõ',
                    ),
                ],
            },
        ],
    },
];
