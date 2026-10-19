import type { LocalizedText } from '@aihome/config-schema';

export type ParkingCountOption = {
    readonly value: string;
    readonly label: LocalizedText;
};

export const PARKING_COUNT_OPTIONS: readonly ParkingCountOption[] = [
    {
        value: 'none',
        label: {
            ja: '不要（0台）',
            en: 'Not needed (0 cars)',
            vi: 'Không cần (0 xe)',
        },
    },
    {
        value: 'cars_1',
        label: {
            ja: '1台',
            en: '1 car',
            vi: '1 xe',
        },
    },
    {
        value: 'cars_2',
        label: {
            ja: '2台',
            en: '2 cars',
            vi: '2 xe',
        },
    },
    {
        value: 'cars_3',
        label: {
            ja: '3台',
            en: '3 cars',
            vi: '3 xe',
        },
    },
    {
        value: 'cars_4_plus',
        label: {
            ja: '4台以上',
            en: '4+ cars',
            vi: 'Từ 4 xe trở lên',
        },
    },
];

export type ParkingCheckboxOption = {
    readonly value: string;
    readonly label: LocalizedText;
};

export const PARKING_CHECKBOX_OPTIONS: readonly ParkingCheckboxOption[] = [
    {
        value: 'carport',
        label: {
            ja: 'カーポートを希望',
            en: 'Carport requested',
            vi: 'Muốn có mái che xe (Carport)',
        },
    },
    {
        value: 'guest_parking',
        label: {
            ja: '来客用も確保したい',
            en: 'Guest parking space',
            vi: 'Muốn có chỗ đỗ cho khách',
        },
    },
];
