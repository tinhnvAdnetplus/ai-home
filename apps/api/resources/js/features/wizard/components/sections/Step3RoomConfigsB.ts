import { Layers, BookOpen, Ellipsis } from 'lucide-react';
import {
    type RoomConfig,
    ro,
    c0,
    c1,
    c2,
    c3p,
    consult,
} from './Step3RoomConfigsTypes';

export const ROOM_CONFIGS_B: readonly RoomConfig[] = [
    {
        id: 'tatami',
        title: {
            ja: '和室・畳スペース',
            en: 'Tatami space',
            vi: 'Phòng chiếu tatami',
        },
        photoName: 'room-tatami',
        countKey: 'plan_tatami_count',
        sizeKey: 'plan_tatami_size',
        fallbackIcon: Layers,
        countOptions: [c0, c1, c2],
        sizeOptions: [
            ro(
                'size_3_4_5',
                '3〜4.5畳程度',
                '~3–4.5 tatami',
                'Khoảng 3–4.5 chiếu',
            ),
            ro('size_6', '6畳程度', '~6 tatami', 'Khoảng 6 chiếu'),
            ro('size_8_plus', '8畳以上', '8+ tatami', 'Từ 8 chiếu trở lên'),
            consult,
        ],
    },
    {
        id: 'study',
        title: {
            ja: '書斎・ワークスペース',
            en: 'Study / workspace',
            vi: 'Phòng làm việc',
        },
        photoName: 'room-study',
        countKey: 'plan_study_count',
        sizeKey: 'plan_study_size',
        fallbackIcon: BookOpen,
        countOptions: [c0, c1, c2],
        sizeOptions: [
            ro('size_2_3', '2〜3畳程度', '~2–3 tatami', 'Khoảng 2–3 chiếu'),
            ro('size_4_5', '4〜5畳程度', '~4–5 tatami', 'Khoảng 4–5 chiếu'),
            ro('size_6_plus', '6畳以上', '6+ tatami', 'Từ 6 chiếu trở lên'),
            consult,
        ],
    },
    {
        id: 'other',
        title: {
            ja: 'その他の個室',
            en: 'Other private room',
            vi: 'Phòng riêng khác',
        },
        photoName: 'room-other',
        countKey: 'plan_other_room_count',
        sizeKey: 'plan_other_room_size',
        fallbackIcon: Ellipsis,
        countOptions: [c0, c1, c2, c3p],
        sizeOptions: [
            ro('size_4_5', '4.5畳程度', '~4.5 tatami', 'Khoảng 4.5 chiếu'),
            ro('size_6', '6畳程度', '~6 tatami', 'Khoảng 6 chiếu'),
            ro('size_8_plus', '8畳以上', '8+ tatami', 'Từ 8 chiếu trở lên'),
            consult,
        ],
    },
];
