import { type Section } from '@aihome/config-schema';
import { imgOpt, tx } from '../builders';

export const step4SectionsA: readonly Section[] = [
    {
        key: 'life_priorities_section',
        title: tx(
            '1. 重視するポイント（複数選択可）',
            '1. Important priorities (Multiple choice)',
            '1. Điểm chú trọng (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'life_priorities',
                label: tx(
                    '重視するポイント',
                    'Important priorities',
                    'Điểm chú trọng',
                ),
                required: false,
                multiple: true,
                defaultValue: [
                    'family_communication',
                    'housework_flow',
                    'daylight_air',
                ],
                binding: 'priorities.priorities',
                options: [
                    imgOpt(
                        'family_communication',
                        'life-priority-communication',
                        '家族との\nコミュニケーション',
                        'Family communication',
                        'Gắn kết gia đình',
                    ),
                    imgOpt(
                        'housework_flow',
                        'life-priority-housework',
                        '家事のしやすさ\n(家事動線)',
                        'Easy housework flow',
                        'Thuận tiện làm việc nhà',
                    ),
                    imgOpt(
                        'storage_rich',
                        'life-priority-storage',
                        '収納の多さ',
                        'Abundant storage',
                        'Nhiều không gian lưu trữ',
                    ),
                    imgOpt(
                        'daylight_air',
                        'life-priority-daylight',
                        '明るさ・風通し',
                        'Daylight & ventilation',
                        'Thông thoáng, đón sáng',
                    ),
                    imgOpt(
                        'privacy',
                        'life-priority-privacy',
                        'プライバシー',
                        'Privacy',
                        'Đảm bảo sự riêng tư',
                    ),
                    imgOpt(
                        'barrier_free',
                        'life-priority-barrier-free',
                        '将来の\nバリアフリー対応',
                        'Future barrier-free access',
                        'Không rào cản cho tương lai',
                    ),
                ],
            },
        ],
    },
    {
        key: 'life_flow_section',
        title: tx(
            '2. 生活動線の希望（複数選択可）',
            '2. Daily traffic flow preferences (Multiple choice)',
            '2. Nguyện vọng về luồng di chuyển (Có thể chọn nhiều)',
        ),
        fields: [
            {
                type: 'image_select',
                key: 'life_flow',
                label: tx(
                    '生活動線の希望',
                    'Daily traffic flow preferences',
                    'Nguyện vọng về luồng di chuyển',
                ),
                required: false,
                multiple: true,
                defaultValue: ['wash_from_entry', 'short_laundry_flow'],
                options: [
                    imgOpt(
                        'wash_from_entry',
                        'life-flow-wash-entry',
                        '玄関から洗面所へ\n直接行きたい',
                        'Direct access from entrance to washroom',
                        'Từ sảnh vào thẳng khu rửa tay',
                    ),
                    imgOpt(
                        'kitchen_view_kids',
                        'life-flow-kitchen-kids',
                        'キッチンから\n子どもの様子を\n見たい',
                        'Keep an eye on kids from the kitchen',
                        'Quan sát con cái từ bếp',
                    ),
                    imgOpt(
                        'short_laundry_flow',
                        'life-flow-laundry',
                        '洗濯動線を\n短くしたい',
                        'Short laundry flow',
                        'Rút ngắn đường di chuyển giặt phơi',
                    ),
                    imgOpt(
                        'entry_to_kitchen',
                        'life-flow-entry-kitchen',
                        '玄関→キッチン\nの動線を重視',
                        'Entrance to kitchen flow',
                        'Lối đi thuận tiện từ sảnh vào bếp',
                    ),
                ],
            },
        ],
    },
];
