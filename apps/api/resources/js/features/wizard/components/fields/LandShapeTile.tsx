import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { normalizeLandShape, LandShapeSvg } from '../../lib/land-shape-svg';
import { type ImageTileProps } from './ImageTileTypes';

export function LandShapeTile({
    option,
    isSelected,
    isDisabled,
    onPick,
}: ImageTileProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const shape = normalizeLandShape(option.image.mediaId || option.value);

    return (
        <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => {
                onPick(option.value);
            }}
            className={cn(
                'group relative flex h-[102px] flex-col items-center justify-between rounded-xl border bg-white p-2 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                    ? 'border-2 border-primary bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            {isSelected ? (
                <span className="absolute left-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                    <Check
                        className="h-2.5 w-2.5 stroke-[3]"
                        aria-hidden="true"
                    />
                </span>
            ) : null}
            <div className="flex-1 w-full flex items-center justify-center min-h-[48px]">
                <LandShapeSvg shape={shape} className="h-12 w-auto" />
            </div>
            <span
                className={cn(
                    'text-xs xl:text-[11.5px] leading-tight text-center font-medium',
                    isSelected ? 'font-bold text-primary' : 'text-slate-700',
                )}
            >
                {resolveLocalized(option.label, i18n.language)}
            </span>
        </button>
    );
}
