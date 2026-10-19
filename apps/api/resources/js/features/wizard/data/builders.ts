import {
    type ImageSelectOption,
    type LocalizedText,
    type Option,
} from '@aihome/config-schema';

export function tx(ja: string, en: string, vi: string): LocalizedText {
    return { ja, en, vi };
}

export function opt(value: string, ja: string, en: string, vi: string): Option {
    return { value, label: tx(ja, en, vi) };
}

/** Option tile with a picture; `mediaId` `icon-*` / `style-*` select built-in illustrations (see lib/option-visuals). */
export function imgOpt(
    value: string,
    mediaId: string,
    ja: string,
    en: string,
    vi: string,
): ImageSelectOption {
    return {
        value,
        label: tx(ja, en, vi),
        image: { mediaId, alt: tx(ja, en, vi) },
    };
}
