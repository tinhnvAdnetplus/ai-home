import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { type ImageTileProps } from './ImageTileTypes';

type GeneralPhotoTileProps = ImageTileProps & {
    readonly photo: string;
};

export function GeneralPhotoTile({
    option,
    isMultiple,
    isSelected,
    isDisabled,
    isAccent = false,
    onPick,
    photo,
}: GeneralPhotoTileProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const isPetTile = option.image.mediaId.startsWith('life-pet-');

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
                'group relative flex h-full min-h-[90px] xl:min-h-[96px] flex-col justify-between rounded-xl border bg-white p-1 xl:p-1.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                    ? isAccent
                        ? 'border-2 border-[#ec3064] shadow-xs'
                        : 'border-2 border-primary shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                <img
                    src={photo}
                    alt=""
                    className={cn(
                        'w-full rounded-lg object-cover transition-transform group-hover:scale-102',
                        isPetTile
                            ? 'aspect-[4/3] max-h-[58px] xl:max-h-[64px]'
                            : 'aspect-[16/10] max-h-[60px] sm:max-h-[64px] xl:max-h-[70px]',
                    )}
                />
            </div>
            <div className="mt-1 flex items-center justify-center gap-1.5 w-full min-h-[28px] xl:min-h-[32px] px-1 min-w-0">
                {isMultiple ? (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3.5px] border transition-colors',
                            isSelected
                                ? isAccent
                                    ? 'border-[#ec3064] bg-[#ec3064] text-white'
                                    : 'border-primary bg-primary text-white'
                                : 'border-slate-300 bg-white',
                        )}
                    >
                        {isSelected ? (
                            <Check
                                className="h-3 w-3 stroke-[3]"
                                aria-hidden="true"
                            />
                        ) : null}
                    </span>
                ) : null}
                <span
                    className={cn(
                        'text-xs xl:text-[12px] leading-snug tracking-tight break-words whitespace-pre-line text-center',
                        isSelected
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-700',
                    )}
                >
                    {resolveLocalized(option.label, i18n.language)}
                </span>
            </div>
        </button>
    );
}
