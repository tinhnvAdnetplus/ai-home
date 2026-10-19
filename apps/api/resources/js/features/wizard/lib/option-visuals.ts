import { type OptionVisual, NEUTRAL } from './option-visuals-types';
import { STEP_VISUALS } from './option-visuals-steps';
import { LIFESTYLE_VISUALS } from './option-visuals-lifestyle';

export type { OptionVisual };

const ALL_VISUALS: Readonly<Record<string, OptionVisual>> = {
    ...STEP_VISUALS,
    ...LIFESTYLE_VISUALS,
};

export function getOptionVisual(mediaId: string | undefined): OptionVisual {
    if (mediaId === undefined) {
        return NEUTRAL;
    }
    return ALL_VISUALS[mediaId] ?? NEUTRAL;
}
