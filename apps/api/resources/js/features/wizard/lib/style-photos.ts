import modernUrl from '../assets/generated/style-modern.jpg';
import naturalUrl from '../assets/generated/style-natural.jpg';
import waUrl from '../assets/generated/style-wafu.jpg';
import westernUrl from '../assets/generated/style-western.jpg';
import livingUrl from '../assets/generated/hero-living.jpg';
import kitchenUrl from '../assets/generated/hero-kitchen.jpg';

/** Photos for `style-*` and `design-style-*` media ids using generated high-res assets. */
const STYLE_PHOTOS: Readonly<Record<string, string>> = {
    'style-modern': modernUrl,
    'style-natural': naturalUrl,
    'style-wa': waUrl,
    'style-western': westernUrl,
    'design-style-modern': modernUrl,
    'design-style-natural': naturalUrl,
    'design-style-wafu': waUrl,
    'design-style-western': westernUrl,
    'design-interior-natural': naturalUrl,
    'design-interior-modern': livingUrl,
    'design-interior-hotel': livingUrl,
    'design-interior-wafu': waUrl,
    'design-interior-nordic': westernUrl,
};

/** Optional map for `photo-*` media ids. If an id is not mapped, falls back to undefined (icon fallback). */
const PHOTO_MAP: Readonly<Record<string, string>> = {
    'photo-modern': modernUrl,
    'photo-natural': naturalUrl,
    'photo-wa': waUrl,
    'photo-western': westernUrl,
    'photo-modern-exterior': modernUrl,
    'photo-bright-dining': kitchenUrl,
    'photo-wafu-exterior': waUrl,
    'photo-living-room': livingUrl,
    'photo-natural-interior': naturalUrl,
    'photo-stylish-exterior': modernUrl,
};

export function getStylePhoto(mediaId: string): string | undefined {
    return STYLE_PHOTOS[mediaId];
}

export function getPhotoTile(mediaId: string): string | undefined {
    if (mediaId.startsWith('style-') || mediaId.startsWith('design-')) {
        return STYLE_PHOTOS[mediaId];
    }
    if (mediaId.startsWith('photo-')) {
        return PHOTO_MAP[mediaId];
    }
    return undefined;
}
