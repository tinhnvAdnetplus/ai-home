import { type Field } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step3RoomsFieldsB: readonly Field[] = [
    {
        type: 'select',
        key: 'plan_tatami_count',
        label: tx(
            '和室・畳スペース：数',
            'Tatami space: count',
            'Phòng tatami: số lượng',
        ),
        required: true,
        defaultValue: 'count_0',
        options: [
            opt('count_0', '0', '0', '0'),
            opt('count_1', '1', '1', '1'),
            opt('count_2', '2', '2', '2'),
        ],
    },
    {
        type: 'select',
        key: 'plan_tatami_size',
        label: tx(
            '和室・畳スペース：広さの希望',
            'Tatami space: desired size',
            'Phòng tatami: diện tích mong muốn',
        ),
        required: false,
        placeholder: tx('選択してください', 'Please select', 'Vui lòng chọn'),
        disabledWhen: { '==': [{ var: 'plan_tatami_count' }, 'count_0'] },
        options: [
            opt(
                'size_3_4_5',
                '3〜4.5畳程度',
                'Approx. 3-4.5 tatami',
                'Khoảng 3–4.5 chiếu',
            ),
            opt('size_6', '6畳程度', 'Approx. 6 tatami', 'Khoảng 6 chiếu'),
            opt('size_8_plus', '8畳以上', '8+ tatami', 'Từ 8 chiếu trở lên'),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
    {
        type: 'select',
        key: 'plan_study_count',
        label: tx(
            '書斎・ワークスペース：数',
            'Study/workspace: count',
            'Phòng làm việc: số lượng',
        ),
        required: true,
        defaultValue: 'count_0',
        options: [
            opt('count_0', '0', '0', '0'),
            opt('count_1', '1', '1', '1'),
            opt('count_2', '2', '2', '2'),
        ],
    },
    {
        type: 'select',
        key: 'plan_study_size',
        label: tx(
            '書斎・ワークスペース：広さの希望',
            'Study/workspace: desired size',
            'Phòng làm việc: diện tích mong muốn',
        ),
        required: false,
        placeholder: tx('選択してください', 'Please select', 'Vui lòng chọn'),
        disabledWhen: { '==': [{ var: 'plan_study_count' }, 'count_0'] },
        options: [
            opt(
                'size_2_3',
                '2〜3畳程度',
                'Approx. 2-3 tatami',
                'Khoảng 2–3 chiếu',
            ),
            opt(
                'size_4_5',
                '4〜5畳程度',
                'Approx. 4-5 tatami',
                'Khoảng 4–5 chiếu',
            ),
            opt('size_6_plus', '6畳以上', '6+ tatami', 'Từ 6 chiếu trở lên'),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
    {
        type: 'select',
        key: 'plan_other_room_count',
        label: tx(
            'その他の個室：数',
            'Other room: count',
            'Phòng riêng khác: số lượng',
        ),
        required: true,
        defaultValue: 'count_0',
        options: [
            opt('count_0', '0', '0', '0'),
            opt('count_1', '1', '1', '1'),
            opt('count_2', '2', '2', '2'),
            opt('count_3_plus', '3以上', '3 or more', 'Từ 3 trở lên'),
        ],
    },
    {
        type: 'select',
        key: 'plan_other_room_size',
        label: tx(
            'その他の個室：広さの希望',
            'Other room: desired size',
            'Phòng riêng khác: diện tích mong muốn',
        ),
        required: false,
        placeholder: tx('選択してください', 'Please select', 'Vui lòng chọn'),
        disabledWhen: { '==': [{ var: 'plan_other_room_count' }, 'count_0'] },
        options: [
            opt(
                'size_4_5',
                '4.5畳程度',
                'Approx. 4.5 tatami',
                'Khoảng 4.5 chiếu',
            ),
            opt('size_6', '6畳程度', 'Approx. 6 tatami', 'Khoảng 6 chiếu'),
            opt('size_8_plus', '8畳以上', '8+ tatami', 'Từ 8 chiếu trở lên'),
            opt('consult', '相談したい', 'Need advice', 'Cần tư vấn'),
        ],
    },
];
