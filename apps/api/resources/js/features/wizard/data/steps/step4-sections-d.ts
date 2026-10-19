import { type Section } from '@aihome/config-schema';
import { opt, tx } from '../builders';

export const step4SectionsD: readonly Section[] = [
    {
        key: 'life_future_section',
        title: tx(
            '7. 将来の暮らしの変化',
            '7. Future lifestyle changes',
            '7. Thay đổi lối sống trong tương lai',
        ),
        fields: [
            {
                type: 'radio',
                key: 'life_future',
                label: tx(
                    '将来の暮らしの変化',
                    'Future lifestyle changes',
                    'Thay đổi lối sống trong tương lai',
                ),
                required: false,
                defaultValue: 'continue_after_independence',
                options: [
                    opt(
                        'continue_after_independence',
                        '子どもの独立後も住み続けたい',
                        'Continue living here after children leave',
                        'Tiếp tục sinh sống sau khi con cái ra riêng',
                    ),
                    opt(
                        'two_generation',
                        '二世帯での暮らしも検討',
                        'Considering two-generation living',
                        'Cân nhắc sống chung hai thế hệ',
                    ),
                    opt(
                        'elderly_friendly',
                        '高齢になっても暮らしやすい家にしたい',
                        'Home that is comfortable in old age',
                        'Nhà thuận tiện sinh hoạt khi về già',
                    ),
                    opt(
                        'rental_utilization',
                        '賃貸として活用も考えたい',
                        'Considering rental utilization',
                        'Cân nhắc cho thuê lại trong tương lai',
                    ),
                    opt(
                        'not_decided',
                        '今のところ特に決まっていない',
                        'Not decided yet',
                        'Hiện tại chưa quyết định',
                    ),
                ],
            },
        ],
    },
    {
        key: 'life_notes_section',
        title: tx(
            '8. その他のご希望（自由記入・任意）',
            '8. Other preferences (Free text / Optional)',
            '8. Nguyện vọng khác (Tự do điền / Tùy chọn)',
        ),
        fields: [
            {
                type: 'textarea',
                key: 'life_notes',
                label: tx(
                    'その他のご希望',
                    'Other preferences',
                    'Nguyện vọng khác',
                ),
                required: false,
                maxLength: 300,
                showCounter: true,
                placeholder: tx(
                    '例：家事動線を短くしたい、リビングを広くしたい、収納を多くしたい、趣味の部屋が欲しい など',
                    'e.g. Short housework flow, spacious living room, plenty of storage, hobby room, etc.',
                    'Ví dụ: Rút ngắn lối làm việc nhà, phòng khách rộng rãi, nhiều chỗ chứa đồ, phòng sở thích...',
                ),
            },
        ],
    },
];
