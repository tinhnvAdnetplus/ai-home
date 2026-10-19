import modernUrl from '../assets/generated/style-modern.jpg';
import naturalUrl from '../assets/generated/style-natural.jpg';
import waUrl from '../assets/generated/style-wafu.jpg';
import westernUrl from '../assets/generated/style-western.jpg';
import houseUrl from '../assets/generated/hero-house.jpg';
import livingUrl from '../assets/generated/hero-living.jpg';
import kitchenUrl from '../assets/generated/hero-kitchen.jpg';
import step5HeroUrl from '../assets/generated/hero-step5.jpg';
import refHouse2Url from '../assets/generated/tiles/ref-house-2story.jpg';
import roomLdkUrl from '../assets/generated/tiles/room-ldk.jpg';
import roomTatamiUrl from '../assets/generated/tiles/room-tatami.jpg';
import roomMasterUrl from '../assets/generated/tiles/room-master.jpg';
import roomStudyUrl from '../assets/generated/tiles/room-study.jpg';
import roomOtherUrl from '../assets/generated/tiles/room-other.jpg';
import parkingCarUrl from '../assets/generated/tiles/parking-car.jpg';

export const STEP5_EXTERIOR_PHOTOS: Readonly<Record<string, string>> = {
    modern: modernUrl,
    natural: naturalUrl,
    japanese_modern: waUrl,
    western: westernUrl,
    stylish: step5HeroUrl,
    other: refHouse2Url,
};

export const STEP5_INTERIOR_PHOTOS: Readonly<Record<string, string>> = {
    natural: kitchenUrl,
    modern: livingUrl,
    hotel_like: roomMasterUrl,
    japanese_modern: roomTatamiUrl,
    scandinavian: roomStudyUrl,
    industrial: roomOtherUrl,
};

export const STEP5_FEATURE_PHOTOS: Readonly<Record<string, string>> = {
    large_window: roomLdkUrl,
    wood_deck: houseUrl,
    fukinuke: livingUrl,
    simple_facade: refHouse2Url,
    green_exterior: naturalUrl,
    garage: parkingCarUrl,
};

export const STEP5_GALLERY_PHOTOS: Readonly<Record<string, string>> = {
    photo_modern_exterior: modernUrl,
    photo_bright_dining: kitchenUrl,
    photo_wa_exterior: waUrl,
    photo_living_room: livingUrl,
    photo_natural_interior: roomLdkUrl,
    photo_stylish_exterior: step5HeroUrl,
};

export type TwoLineLabel = {
    readonly title: string;
    readonly subtitle?: string | undefined;
};

export function splitTwoLineLabel(label: string): TwoLineLabel {
    const fullParenIndex = label.indexOf('（');
    const halfParenIndex = label.indexOf('(');
    const parenIndex = fullParenIndex !== -1 ? fullParenIndex : halfParenIndex;
    if (parenIndex !== -1) {
        return {
            title: label.slice(0, parenIndex).trim(),
            subtitle: label.slice(parenIndex).trim(),
        };
    }
    const slashIndex = label.indexOf('/');
    if (slashIndex !== -1) {
        return {
            title: label.slice(0, slashIndex).trim(),
            subtitle: label.slice(slashIndex + 1).trim(),
        };
    }
    const dotIndex = label.indexOf('・');
    if (dotIndex !== -1 && !label.includes('和風')) {
        return {
            title: label.slice(0, dotIndex).trim(),
            subtitle: label.slice(dotIndex + 1).trim(),
        };
    }
    return { title: label };
}
