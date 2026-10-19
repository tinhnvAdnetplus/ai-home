import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { type ImageTileProps } from './ImageTileTypes';

type SwatchTileProps = ImageTileProps & {
    readonly swatch: string;
};

export function SwatchTile({
    option,
    isMultiple,
    isSelected,
    isDisabled,
    isAccent = false,
    onPick,
    swatch,
}: SwatchTileProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const isColorCircle = option.image.mediaId.startsWith('color-');
    const isWhite = option.image.mediaId === 'color-white';

    return (
        <button
            type="button"
            role={isMultiple ? undefined : 'radio'}
            aria-checked={isMultiple ? undefined : isSelected}
            aria-pressed={isMultiple ? isSelected : undefined}
            disabled={isDisabled}
            onClick={() => {
                onPick(option.value);
            }}
            className={cn(
                'relative flex min-h-[44px] min-w-[44px] sm:h-[50px] sm:w-[38px] sm:min-h-0 sm:min-w-0 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border bg-white px-1 py-1 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                    ? isAccent
                        ? 'border-2 border-[#ec3064] bg-rose-50/20'
                        : 'border-2 border-primary bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            {isColorCircle ? (
                <span
                    aria-hidden="true"
                    className={cn(
                        'h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 rounded-full border border-slate-300/80 shadow-xs flex items-center justify-center',
                        swatch,
                    )}
                >
                    {isSelected ? (
                        <Check
                            className={cn(
                                'h-3.5 w-3.5 stroke-[3]',
                                isWhite
                                    ? 'text-slate-800'
                                    : 'text-white drop-shadow',
                            )}
                            aria-hidden="true"
                        />
                    ) : null}
                </span>
            ) : (
                <span
                    aria-hidden="true"
                    className={cn(
                        'h-5 sm:h-5.5 w-full rounded-md border border-slate-300/70 shadow-xs flex items-center justify-center shrink-0',
                        swatch,
                    )}
                >
                    {isSelected ? (
                        <Check
                            className="h-3 w-3 text-white drop-shadow stroke-[3]"
                            aria-hidden="true"
                        />
                    ) : null}
                </span>
            )}
            <span
                className={cn(
                    'text-xs sm:text-[9px] leading-tight text-center whitespace-nowrap',
                    isSelected
                        ? 'font-bold text-slate-900'
                        : 'font-medium text-slate-600',
                )}
            >
                {resolveLocalized(option.label, i18n.language)}
            </span>
        </button>
    );
}
