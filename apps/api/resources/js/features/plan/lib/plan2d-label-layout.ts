import { type TFunction } from 'i18next';
import { type Fixture, type Room } from '@aihome/bdm';
import { localizeRoomName } from './room-names';
import { computePointsBounds, calculateJo } from './plan2d-geometry';
import { ROOM_LABEL_COLORS } from './plan2d-colors';
import {
    type LabelBox,
    type LabelLayout,
    computeLabelBox,
    measureTextUnits,
} from './plan2d-label-types';
import {
    buildFixtureObstacleBoxes,
    findBestRoomLabelAnchor,
} from './plan2d-label-anchor';
import { resolveLabelOverlaps } from './plan2d-label-collision';

export type { LabelBox, LabelLayout };

function getShortRoomName(room: Room, t: TFunction): string {
    if (room.type === 'laundry') {
        return t('plan:rooms.laundryShort');
    }
    if (room.type === 'walkInCloset') {
        return t('plan:rooms.wicShort');
    }
    const localized = localizeRoomName(room.name, t);
    if (localized.includes('ランドリールーム')) {
        return t('plan:rooms.laundryShort');
    }
    if (localized.includes('シューズクローク')) {
        return t('plan:rooms.sicShort');
    }
    if (localized.includes('ウォークインクローゼット')) {
        return t('plan:rooms.wicShort');
    }
    return localized;
}

export function computeRoomLabelLayouts(
    rooms: readonly Room[],
    t: TFunction,
    fixtures: readonly Fixture[] = [],
): readonly LabelLayout[] {
    const fixtureBoxes = buildFixtureObstacleBoxes(fixtures, rooms);

    const layouts: LabelLayout[] = rooms.map((room) => {
        const b = computePointsBounds(room.polygon);
        const isNarrow = b.width < 1500 || b.height < 1500 || room.areaM2 < 3.8;
        const isVeryNarrow =
            b.width < 1100 || b.height < 1100 || room.areaM2 < 2.5;
        const isLarge = room.areaM2 >= 15;

        const name =
            isNarrow || isVeryNarrow
                ? getShortRoomName(room, t)
                : localizeRoomName(room.name, t);

        const baseFont = isVeryNarrow
            ? 150
            : isNarrow
              ? 190
              : isLarge
                ? 300
                : 240;
        const innerWidth = Math.max(320, b.width - 240);
        const maxFontByWidth = Math.floor(innerWidth / measureTextUnits(name));
        const fontSize = Math.min(baseFont, Math.max(95, maxFontByWidth));
        const hasJo =
            !isNarrow &&
            !isVeryNarrow &&
            room.type !== 'void' &&
            room.type !== 'stairs' &&
            b.height >= 1600;
        const anchor = findBestRoomLabelAnchor(
            room,
            name,
            fontSize,
            hasJo,
            fixtureBoxes,
            rooms,
        );

        return {
            id: room.id,
            name,
            joStr: calculateJo(room.areaM2),
            textColor: ROOM_LABEL_COLORS[room.type],
            hasJo,
            x: anchor.x,
            y: anchor.y,
            fontSize,
            box: computeLabelBox(
                anchor.x,
                anchor.y,
                name,
                fontSize,
                hasJo,
            ),
        };
    });

    resolveLabelOverlaps(layouts);

    return layouts;
}

