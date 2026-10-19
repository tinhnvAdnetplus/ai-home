import { type Section } from '@aihome/config-schema';
import { imgOpt, opt, tx } from '../builders';

export const step1SectionsB: readonly Section[] = [
    {
        key: 'floors_section',
        title: tx(
            '3. 希望する階数',
            '3. Number of floors',
            '3. Số tầng mong muốn',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'floors',
                label: tx(
                    '希望する階数',
                    'Number of floors',
                    'Số tầng mong muốn',
                ),
                required: true,
                multiple: false,
                defaultValue: 'two_story',
                options: [
                    imgOpt(
                        'one_story',
                        'icon-one-story',
                        '平屋',
                        'One storey',
                        'Nhà một tầng',
                    ),
                    imgOpt(
                        'two_story',
                        'icon-two-story',
                        '2階建て',
                        'Two storeys',
                        'Nhà hai tầng',
                    ),
                    imgOpt(
                        'three_story',
                        'icon-three-story',
                        '3階建て',
                        'Three storeys',
                        'Nhà ba tầng',
                    ),
                    imgOpt(
                        'consult',
                        'icon-consult',
                        '相談したい',
                        'I want advice',
                        'Cần tư vấn',
                    ),
                ],
            },
        ],
    },
    {
        key: 'family_section',
        title: tx('4. 家族構成', '4. Family', '4. Thành viên gia đình'),
        fields: [
            {
                type: 'select',
                key: 'family_adults',
                label: tx('大人の人数', 'Adults', 'Số người lớn'),
                required: true,
                defaultValue: 'two',
                options: [
                    opt('one', '1人', '1 person', '1 người'),
                    opt('two', '2人', '2 people', '2 người'),
                    opt('three', '3人', '3 people', '3 người'),
                    opt('four', '4人', '4 people', '4 người'),
                    opt('five_plus', '5人以上', '5 or more', '5 người trở lên'),
                ],
            },
            {
                type: 'select',
                key: 'family_children',
                label: tx('子どもの人数', 'Children', 'Số trẻ em'),
                required: true,
                defaultValue: 'two',
                options: [
                    opt('none', '0人', '0', '0'),
                    opt('one', '1人', '1 child', '1 trẻ'),
                    opt('two', '2人', '2 children', '2 trẻ'),
                    opt('three_plus', '3人以上', '3 or more', '3 trẻ trở lên'),
                ],
            },
        ],
    },
];
