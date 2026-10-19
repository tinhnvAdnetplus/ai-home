import { House, type LucideIcon } from 'lucide-react';

export type OptionVisual = {
    readonly Icon: LucideIcon;
    /** Tailwind classes for the picture area of an image tile. */
    readonly tone: string;
    /** When set, the picture area is a plain colour swatch (Tailwind background class) instead of an icon. */
    readonly swatch?: string;
};

export function swatch(background: string): OptionVisual {
    return { Icon: House, tone: 'bg-muted', swatch: background };
}

export function icon(Icon: LucideIcon): OptionVisual {
    return { Icon, tone: 'bg-brand-50 text-primary' };
}

export const NEUTRAL: OptionVisual = {
    Icon: House,
    tone: 'bg-brand-50 text-primary',
};
