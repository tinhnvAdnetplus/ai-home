import { type RoomType } from '@aihome/bdm';
import { type RoomStyle } from '../types/plan-view-types';
import { ROOM_TINT_COLORS, ROOM_LABEL_COLORS } from './plan2d-colors';

export function getRoomStyle(type: RoomType, isColorMode = false): RoomStyle {
    const fill = isColorMode ? ROOM_TINT_COLORS[type] : '#ffffff';
    const textColor = ROOM_LABEL_COLORS[type];

    return {
        fill,
        stroke: '#c8d1cb',
        textColor,
    };
}
