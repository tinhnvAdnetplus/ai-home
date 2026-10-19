import { type LucideIcon } from 'lucide-react';
import { type LocalizedText } from '@aihome/config-schema';

export type RoomOption = {
    readonly value: string;
    readonly label: LocalizedText;
};

export type RoomConfig = {
    readonly id: string;
    readonly title: LocalizedText;
    readonly photoName: string;
    readonly countKey: string;
    readonly sizeKey: string;
    readonly fallbackIcon: LucideIcon;
    readonly countOptions: readonly RoomOption[];
    readonly sizeOptions: readonly RoomOption[];
};

export const DEFAULT_COUNT_VALUE = 'count_0';

export const ro = (
    value: string,
    ja: string,
    en: string,
    vi: string,
): RoomOption => ({ value, label: { ja, en, vi } });

export const c0 = ro('count_0', '0', '0', '0');
export const c1 = ro('count_1', '1', '1', '1');
export const c2 = ro('count_2', '2', '2', '2');
export const c3 = ro('count_3', '3', '3', '3');
export const c3p = ro('count_3_plus', '3以上', '3+', 'Từ 3 trở lên');
export const c4p = ro('count_4_plus', '4以上', '4+', 'Từ 4 trở lên');
export const consult = ro('consult', '相談したい', 'Need advice', 'Cần tư vấn');
