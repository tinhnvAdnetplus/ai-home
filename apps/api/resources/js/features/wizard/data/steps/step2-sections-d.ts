import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step2SectionsD: readonly Section[] = [
    {
        key: 'surroundings_section',
        title: tx(
            '8. 敷地の周辺環境',
            '8. Surroundings',
            '8. Môi trường xung quanh khu đất',
        ),
        fields: [
            {
                type: 'checkbox_group',
                key: 'surroundings',
                label: tx('周辺環境', 'Surroundings', 'Môi trường xung quanh'),
                required: false,
                defaultValue: ['residential'],
                binding: 'site.surroundings',
                options: [
                    opt(
                        'residential',
                        '住宅地',
                        'Residential area',
                        'Khu dân cư',
                    ),
                    opt(
                        'commercial',
                        '商業地域',
                        'Commercial area',
                        'Khu thương mại',
                    ),
                    opt(
                        'rural',
                        '田園・郊外',
                        'Rural / Suburban',
                        'Đồng quê / Ngoại ô',
                    ),
                    opt(
                        'near_mountain',
                        '山の近く',
                        'Near mountains',
                        'Gần núi',
                    ),
                    opt('near_sea', '海の近く', 'Near sea', 'Gần biển'),
                    opt('other', 'その他', 'Other', 'Khác'),
                ],
            },
            {
                type: 'text',
                key: 'land_surroundings_other',
                label: tx('その他の内容', 'Other details', 'Chi tiết khác'),
                required: false,
                maxLength: 100,
                placeholder: tx(
                    'その他の内容を入力',
                    'Enter other details',
                    'Nhập nội dung khác',
                ),
            },
        ],
    },
    {
        key: 'drawings_photos_section',
        title: tx(
            '9. 土地の図面・写真',
            '9. Land survey and photos',
            '9. Bản vẽ và hình ảnh khu đất',
        ),
        fields: [
            {
                type: 'upload',
                key: 'land_survey_file',
                label: tx(
                    '土地の図面・写真',
                    'Land survey and photos',
                    'Bản vẽ và hình ảnh khu đất',
                ),
                required: false,
                accept: [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                ],
                maxFiles: 3,
                maxSizeMb: 10,
                help: tx(
                    'PDF・画像ファイル対応（測量図、敷地図、現地写真など）',
                    'Accepts PDF and image files (survey maps, site plans, photos, etc.)',
                    'Hỗ trợ tệp PDF và hình ảnh (bản đồ đo đạc, sơ đồ khu đất, ảnh hiện trường...)',
                ),
            },
        ],
    },
];
