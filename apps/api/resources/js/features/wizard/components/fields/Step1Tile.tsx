import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { Step1TileIcon } from '../../lib/step1-icons';
import { type ImageTileProps } from './ImageTileTypes';

export function Step1Tile({
    option,
    isMultiple,
    isSelected,
    isDisabled,
    onPick,
}: ImageTileProps): React.JSX.Element {
    const { i18n } = useTranslation();

    const isCard3 = [
        'icon-one-story',
        'icon-two-story',
        'icon-three-story',
        'icon-consult',
    ].includes(option.image.mediaId);

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
                'relative flex w-full flex-col items-center justify-center rounded-xl border bg-white text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isCard3
                    ? 'min-h-[75px] xl:min-h-[82px] xl:h-[82px] gap-1 p-1.5'
                    : 'min-h-[95px] xl:min-h-[114px] xl:h-[114px] gap-1.5 p-2',
                isSelected
                    ? 'border-2 border-primary bg-[#eef6ff] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            {isSelected ? (
                <span
                    className={cn(
                        'absolute z-10 flex items-center justify-center rounded-full bg-primary text-white shadow-xs',
                        isCard3
                            ? 'left-1.5 top-1.5 h-3.5 w-3.5'
                            : 'left-2 top-2 h-[18px] w-[18px]',
                    )}
                >
                    <Check
                        className={cn(
                            'stroke-[3]',
                            isCard3 ? 'h-2 w-2' : 'h-2.5 w-2.5',
                        )}
                        aria-hidden="true"
                    />
                </span>
            ) : null}
            <div
                className={cn(
                    'flex items-center justify-center shrink-0',
                    isCard3
                        ? 'h-9 w-9 xl:h-10 xl:w-10'
                        : 'h-11 w-11 xl:h-12 xl:w-12',
                )}
            >
                <Step1TileIcon
                    mediaId={option.image.mediaId}
                    className={cn(
                        isCard3
                            ? 'h-9 w-9 xl:h-10 xl:w-10'
                            : 'h-11 w-11 xl:h-12 xl:w-12',
                    )}
                    isSelected={isSelected}
                />
            </div>
            <span
                className={cn(
                    'leading-tight text-center px-0.5 break-words whitespace-pre-line',
                    isCard3
                        ? 'text-xs xl:text-[13.5px]'
                        : option.value === 'rental_combo'
                          ? 'text-xs xl:text-[12.5px] tracking-tight'
                          : 'text-xs xl:text-[13.5px]',
                    isSelected
                        ? 'font-bold text-primary'
                        : 'font-medium text-slate-700',
                )}
            >
                {resolveLocalized(option.label, i18n.language)}
            </span>
        </button>
    );
}
