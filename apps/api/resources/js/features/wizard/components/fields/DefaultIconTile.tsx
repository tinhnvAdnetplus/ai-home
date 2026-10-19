import { useTranslation } from 'react-i18next';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { type ImageTileProps } from './ImageTileTypes';

type DefaultIconTileProps = ImageTileProps & {
    readonly Icon: LucideIcon;
    readonly tone: string;
};

export function DefaultIconTile({
    option,
    isMultiple,
    isSelected,
    isDisabled,
    isAccent = false,
    onPick,
    Icon,
    tone,
}: DefaultIconTileProps): React.JSX.Element {
    const { i18n } = useTranslation();

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
                'group relative flex h-[64px] min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border bg-white p-1.5 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                    ? isAccent
                        ? 'border-2 border-[#ec3064] bg-rose-50/20 shadow-xs'
                        : 'border-2 border-primary bg-sky-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            {isSelected && !isMultiple ? (
                <span
                    className={cn(
                        'absolute left-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-xs',
                        isAccent ? 'bg-[#ec3064]' : 'bg-primary',
                    )}
                >
                    <Check
                        className="h-2.5 w-2.5 stroke-[3]"
                        aria-hidden="true"
                    />
                </span>
            ) : null}
            <div
                className={cn(
                    'flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-transform group-hover:scale-105 shrink-0',
                    tone,
                )}
            >
                <Icon
                    className="h-3.5 w-3.5 stroke-[1.75]"
                    aria-hidden="true"
                />
            </div>
            <div className="flex items-center justify-center gap-1 w-full px-0.5 min-w-0">
                {isMultiple ? (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px] border transition-colors',
                            isSelected
                                ? isAccent
                                    ? 'border-[#ec3064] bg-[#ec3064] text-white'
                                    : 'border-primary bg-primary text-white'
                                : 'border-slate-300 bg-white',
                        )}
                    >
                        {isSelected ? (
                            <Check
                                className="h-2 w-2 stroke-[3]"
                                aria-hidden="true"
                            />
                        ) : null}
                    </span>
                ) : null}
                <span
                    className={cn(
                        'text-[10px] xl:text-[11px] leading-tight line-clamp-2 break-words text-center',
                        isSelected
                            ? isAccent
                                ? 'font-bold text-[#ec3064]'
                                : 'font-bold text-primary'
                            : 'font-medium text-slate-700',
                    )}
                >
                    {resolveLocalized(option.label, i18n.language)}
                </span>
            </div>
        </button>
    );
}
