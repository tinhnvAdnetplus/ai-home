import { type Field } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step3RoomsFieldsA: readonly Field[] = [
    {
        type: 'select',
        key: 'plan_ldk_count',
        label: tx('LDK：数', 'LDK: count', 'LDK: số lượng'),
        required: true,
        defaultValue: 'count_1',
        options: [
            opt('count_1', '1', '1', '1'),
            opt('count_2', '2', '2', '2'),
            opt('count_3_plus', '3以上', '3 or more', 'Từ 3 trở lên'),
        ],
    },
    {
        type: 'select',
        key: 'plan_ldk_size',
        label: tx(
            'LDK：広さの希望',
            'LDK: desired size',
            'LDK: diện tích mong muốn',
        ),
        required: true,
        defaultValue: 'size_18',
        options: [
            opt('size_14', '14畳程度', 'Approx. 14 tatami', 'Khoảng 14 chiếu'),
            opt('size_16', '16畳程度', 'Approx. 16 tatami', 'Khoảng 16 chiếu'),
            opt('size_18', '18畳程度', 'Approx. 18 tatami', 'Khoảng 18 chiếu'),
            opt('size_20', '20畳程度', 'Approx. 20 tatami', 'Khoảng 20 chiếu'),
            opt('size_22', '22畳程度', 'Approx. 22 tatami', 'Khoảng 22 chiếu'),
            opt(
                'size_24_plus',
                '24畳以上',
                '24+ tatami',
                'Từ 24 chiếu trở lên',
            ),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
    {
        type: 'select',
        key: 'plan_master_bedroom_count',
        label: tx(
            '主寝室：数',
            'Master bedroom: count',
            'Phòng ngủ chính: số lượng',
        ),
        required: true,
        defaultValue: 'count_1',
        options: [opt('count_1', '1', '1', '1'), opt('count_2', '2', '2', '2')],
    },
    {
        type: 'select',
        key: 'plan_master_bedroom_size',
        label: tx(
            '主寝室：広さの希望',
            'Master bedroom: desired size',
            'Phòng ngủ chính: diện tích mong muốn',
        ),
        required: true,
        defaultValue: 'size_8',
        options: [
            opt('size_6', '6畳程度', 'Approx. 6 tatami', 'Khoảng 6 chiếu'),
            opt('size_7', '7畳程度', 'Approx. 7 tatami', 'Khoảng 7 chiếu'),
            opt('size_8', '8畳程度', 'Approx. 8 tatami', 'Khoảng 8 chiếu'),
            opt('size_10', '10畳程度', 'Approx. 10 tatami', 'Khoảng 10 chiếu'),
            opt(
                'size_12_plus',
                '12畳以上',
                '12+ tatami',
                'Từ 12 chiếu trở lên',
            ),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
    {
        type: 'select',
        key: 'plan_kids_room_count',
        label: tx(
            '子ども部屋：数',
            "Children's room: count",
            'Phòng trẻ em: số lượng',
        ),
        required: true,
        defaultValue: 'count_2',
        options: [
            opt('count_0', '0', '0', '0'),
            opt('count_1', '1', '1', '1'),
            opt('count_2', '2', '2', '2'),
            opt('count_3', '3', '3', '3'),
            opt('count_4_plus', '4以上', '4 or more', 'Từ 4 trở lên'),
        ],
    },
    {
        type: 'select',
        key: 'plan_kids_room_size',
        label: tx(
            '子ども部屋：広さの希望',
            "Children's room: desired size",
            'Phòng trẻ em: diện tích mong muốn',
        ),
        required: false,
        defaultValue: 'size_6',
        disabledWhen: { '==': [{ var: 'plan_kids_room_count' }, 'count_0'] },
        options: [
            opt(
                'size_4_5',
                '4.5畳程度',
                'Approx. 4.5 tatami',
                'Khoảng 4.5 chiếu',
            ),
            opt('size_5', '5畳程度', 'Approx. 5 tatami', 'Khoảng 5 chiếu'),
            opt('size_6', '6畳程度', 'Approx. 6 tatami', 'Khoảng 6 chiếu'),
            opt('size_8', '8畳程度', 'Approx. 8 tatami', 'Khoảng 8 chiếu'),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
];
