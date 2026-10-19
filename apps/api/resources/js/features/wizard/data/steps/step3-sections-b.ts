import { type Section } from '@aihome/config-schema';
import { tx } from '../builders';
import { step3RoomsFieldsA } from './step3-rooms-fields-a';
import { step3RoomsFieldsB } from './step3-rooms-fields-b';

export const step3SectionsB: readonly Section[] = [
    {
        key: 'plan_rooms_section',
        title: tx(
            '3. 必要な部屋の数と広さ',
            '3. Desired rooms and sizes',
            '3. Số lượng phòng và diện tích mong muốn',
        ),
        description: tx(
            '※ 数値は目安です。後から調整できます。',
            '* Numbers are estimates and can be adjusted later.',
            '* Số liệu mang tính ước lượng và có thể điều chỉnh sau.',
        ),
        fields: [...step3RoomsFieldsA, ...step3RoomsFieldsB],
    },
];
