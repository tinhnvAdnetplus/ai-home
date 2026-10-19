import {
    type RoomOption,
    type RoomConfig,
    DEFAULT_COUNT_VALUE,
} from './Step3RoomConfigsTypes';
import { ROOM_CONFIGS_A } from './Step3RoomConfigsA';
import { ROOM_CONFIGS_B } from './Step3RoomConfigsB';
import {
    PARKING_COUNT_OPTIONS,
    PARKING_CHECKBOX_OPTIONS,
} from './Step3ParkingConfigs';

export type { RoomOption, RoomConfig };
export { DEFAULT_COUNT_VALUE, PARKING_COUNT_OPTIONS, PARKING_CHECKBOX_OPTIONS };

export const ROOM_CONFIGS: readonly RoomConfig[] = [
    ...ROOM_CONFIGS_A,
    ...ROOM_CONFIGS_B,
];
